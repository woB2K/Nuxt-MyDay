import type { PushPayload } from '../../server/utils/notifications/messages'
import type { PushOutcome, PushSender, PushTarget } from '../../server/utils/notifications/webPush'
import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { runNotificationTick } from '../../server/utils/notifications/tick'
import { authHeaders, householdOf, prisma, registerUser, resetDb, setupApi } from './helpers'

type User = Awaited<ReturnType<typeof registerUser>>

interface Sent {
  endpoint: string
  payload: PushPayload
}

const endpoint = (name: string) => `https://fcm.googleapis.com/fcm/send/${name}`
const keys = { p256dh: 'p256dh-key', auth: 'auth-key' }

const evening = new Date('2026-11-26T21:05:00Z')
const today = '2026-11-26'

function fakeSender(outcome: PushOutcome = 'ok') {
  const sent: Sent[] = []
  const send: PushSender = async (target: PushTarget, payload: PushPayload) => {
    sent.push({ endpoint: target.endpoint, payload })
    return outcome
  }
  return { sent, send }
}

describe('notifications', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  const subscribe = (user: User, name: string) =>
    send(user, '/api/push/subscriptions', 'POST', { endpoint: endpoint(name), expirationTime: null, keys })

  async function status(run: () => Promise<unknown>): Promise<number | undefined> {
    try {
      await run()
      return 200
    } catch (error) {
      return (error as { statusCode?: number }).statusCode
    }
  }

  describe('subscriptions api', () => {
    it('stores one subscription per device and re-subscribing keeps a single row', async () => {
      const user = await registerUser()

      await subscribe(user, 'phone')
      await subscribe(user, 'phone')
      await subscribe(user, 'laptop')

      const rows = await prisma.pushSubscription.findMany({ where: { userId: user.userId }, orderBy: { endpoint: 'asc' } })
      expect(rows.map(row => row.endpoint)).toEqual([endpoint('laptop'), endpoint('phone')])
    })

    it('moves a device to the account that subscribed it last', async () => {
      const anna = await registerUser()
      const boris = await registerUser()

      await subscribe(anna, 'shared')
      await subscribe(boris, 'shared')

      const row = await prisma.pushSubscription.findUniqueOrThrow({ where: { endpoint: endpoint('shared') } })
      expect(row.userId).toBe(boris.userId)
    })

    it('unsubscribes only the caller’s own device', async () => {
      const anna = await registerUser()
      const boris = await registerUser()
      await subscribe(anna, 'phone')

      await send(boris, '/api/push/subscriptions', 'DELETE', { endpoint: endpoint('phone') })
      expect(await prisma.pushSubscription.count()).toBe(1)

      await send(anna, '/api/push/subscriptions', 'DELETE', { endpoint: endpoint('phone') })
      expect(await prisma.pushSubscription.count()).toBe(0)
    })

    it('rejects non-https endpoints and anonymous calls', async () => {
      const user = await registerUser()

      expect(await status(() => send(user, '/api/push/subscriptions', 'POST', { endpoint: 'http://fcm.googleapis.com/x', keys }))).toBe(400)
      expect(await status(() => send(user, '/api/push/subscriptions', 'POST', { endpoint: 'https://10.0.0.5/x', keys }))).toBe(400)
      expect(await status(() => $fetch('/api/push/subscriptions', { method: 'POST', body: { endpoint: endpoint('x'), keys } }))).toBe(401)
    })

    it('answers 503 to a test push and no key when VAPID keys are not configured', async () => {
      const user = await registerUser()

      expect(await status(() => send(user, '/api/push/test', 'POST'))).toBe(503)
      expect(await $fetch('/api/push/key', { headers: authHeaders(user.token) })).toEqual({ publicKey: null })
    })
  })

  describe('settings', () => {
    it('saves reminder times, time zone and hidden amounts and returns them in the profile', async () => {
      const user = await registerUser()

      await send(user, '/api/settings', 'PATCH', { remindFinanceAt: '21:00', remindTasksAt: '09:00', timezone: 'Europe/Moscow', hideAmounts: true })

      const me = await $fetch<{ settings: Record<string, unknown> }>('/api/users/me', { headers: authHeaders(user.token) })
      expect(me.settings).toMatchObject({ remindFinanceAt: '21:00', remindTasksAt: '09:00', timezone: 'Europe/Moscow', hideAmounts: true })

      await send(user, '/api/settings', 'PATCH', { remindTasksAt: null })
      expect((await prisma.appSettings.findUniqueOrThrow({ where: { userId: user.userId } })).remindTasksAt).toBeNull()
    })

    it('rejects an unknown time zone and an off-step time', async () => {
      const user = await registerUser()

      expect(await status(() => send(user, '/api/settings', 'PATCH', { timezone: 'Mars/Olympus' }))).toBe(400)
      expect(await status(() => send(user, '/api/settings', 'PATCH', { remindFinanceAt: '21:03' }))).toBe(400)
    })

    it('sets a reminder on a habit and clears it', async () => {
      const user = await registerUser()
      const habit = await send<{ id: string, reminderAt: string | null }>(user, '/api/habits', 'POST', { name: 'Спорт', icon: 'leaf', color: 'green', reminderAt: '08:00' })
      expect(habit.reminderAt).toBe('08:00')

      const cleared = await send<{ reminderAt: string | null }>(user, `/api/habits/${habit.id}`, 'PATCH', { reminderAt: null })
      expect(cleared.reminderAt).toBeNull()
    })
  })

  describe('tick', () => {
    async function remindable(patch: object = {}) {
      const user = await registerUser()
      await prisma.appSettings.update({ where: { userId: user.userId }, data: { timezone: 'UTC', lang: 'ru', ...patch } })
      await prisma.pushSubscription.create({ data: { userId: user.userId, endpoint: endpoint(user.userId), ...keys } })
      return user
    }

    async function expense(user: User, amount: number) {
      const householdId = await householdOf(user.userId)
      const category = await prisma.category.findFirstOrThrow({ where: { householdId } })
      await prisma.transaction.create({ data: { householdId, userId: user.userId, type: 'EXPENSE', amount, categoryId: category.id, date: new Date(`${today}T00:00:00Z`) } })
    }

    it('sends the evening spending push once, even when the tick runs twice', async () => {
      const user = await remindable({ remindFinanceAt: '21:00' })
      await expense(user, 1240)
      await expense(user, 60)
      const { sent, send: sender } = fakeSender()

      await runNotificationTick({ db: prisma, send: sender, now: evening })
      await runNotificationTick({ db: prisma, send: sender, now: new Date('2026-11-26T21:10:00Z') })

      expect(sent).toHaveLength(1)
      expect(sent[0]!.payload.body).toBe('Сегодня 2 операции · 1 300 ₽ — всё учёл?')
      expect(await prisma.notificationLog.count({ where: { userId: user.userId, key: 'finance' } })).toBe(1)
    })

    it('hides the sum when the user hides amounts', async () => {
      const user = await remindable({ remindFinanceAt: '21:00', hideAmounts: true })
      await expense(user, 500)
      const { sent, send: sender } = fakeSender()

      await runNotificationTick({ db: prisma, send: sender, now: evening })

      expect(sent[0]!.payload.body).toBe('Сегодня 1 операция — всё учёл?')
    })

    it('counts the same tasks as Today and names the first one', async () => {
      const user = await remindable({ remindTasksAt: '09:00' })
      await prisma.task.createMany({
        data: [
          { userId: user.userId, title: 'Без даты' },
          { userId: user.userId, title: 'Просрочено', dueDate: new Date('2026-11-20T00:00:00Z') },
          { userId: user.userId, title: 'Важное', priority: 'HIGH', dueDate: new Date(`${today}T00:00:00Z`) },
          { userId: user.userId, title: 'Завтра', dueDate: new Date('2026-11-27T00:00:00Z') },
          { userId: user.userId, title: 'Сделано', done: true }
        ]
      })
      const { sent, send: sender } = fakeSender()

      await runNotificationTick({ db: prisma, send: sender, now: new Date('2026-11-26T09:00:00Z') })

      expect(sent[0]!.payload.body).toBe('На сегодня 3 задачи, 1 просрочена · первая: Важное')
    })

    it('skips a habit already checked off today and reminds about the rest', async () => {
      const user = await remindable()
      const done = await prisma.habit.create({ data: { userId: user.userId, name: 'Вода', icon: 'droplet', color: 'blue', reminderAt: '08:00' } })
      await prisma.habit.create({ data: { userId: user.userId, name: 'Спорт', icon: 'dumbbell', color: 'red', reminderAt: '08:00' } })
      await prisma.habitMark.create({ data: { habitId: done.id, date: new Date(`${today}T00:00:00Z`) } })
      const { sent, send: sender } = fakeSender()

      await runNotificationTick({ db: prisma, send: sender, now: new Date('2026-11-26T08:00:00Z') })

      expect(sent.map(push => push.payload.title)).toEqual(['Пора: Спорт'])
    })

    it('reads the reminder time in the user’s own time zone', async () => {
      await remindable({ remindFinanceAt: '21:00', timezone: 'Europe/Moscow' })
      const { sent, send: sender } = fakeSender()

      await runNotificationTick({ db: prisma, send: sender, now: evening })
      expect(sent).toHaveLength(0)

      await runNotificationTick({ db: prisma, send: sender, now: new Date('2026-11-26T18:00:00Z') })
      expect(sent).toHaveLength(1)
    })

    it('drops a subscription the push service reports as gone', async () => {
      const user = await remindable({ remindFinanceAt: '21:00' })
      const { send: sender } = fakeSender('gone')

      await runNotificationTick({ db: prisma, send: sender, now: evening })

      expect(await prisma.pushSubscription.count({ where: { userId: user.userId } })).toBe(0)
    })

    it('ignores users without a subscription', async () => {
      const user = await registerUser()
      await prisma.appSettings.update({ where: { userId: user.userId }, data: { remindFinanceAt: '21:00', timezone: 'UTC' } })
      const { sent, send: sender } = fakeSender()

      expect(await runNotificationTick({ db: prisma, send: sender, now: evening })).toEqual({ users: 0, pushes: 0 })
      expect(sent).toHaveLength(0)
    })
  })
})
