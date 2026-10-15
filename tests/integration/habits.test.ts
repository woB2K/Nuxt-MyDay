import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { shiftDay } from '../../shared/calendarDay'
import { authHeaders, prisma, registerUser, resetDb, setupApi } from './helpers'

interface HabitDto {
  id: string
  name: string
  icon: string
  color: string
  perWeek: number | null
  sortOrder: number
  marks: string[]
}

interface TrashDto {
  habits: HabitDto[]
}

type User = Awaited<ReturnType<typeof registerUser>>

const DAY_MS = 24 * 60 * 60 * 1000

describe('habits api', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const today = () => new Date().toISOString().slice(0, 10)

  const get = <T>(user: User, url: string) =>
    $fetch<T>(url, { headers: authHeaders(user.token) })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', body?: object, query?: Record<string, string>) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body, query })

  const habits = (user: User) => get<HabitDto[]>(user, '/api/habits')
  const addHabit = (user: User, name: string, extra: object = {}) =>
    send<HabitDto>(user, '/api/habits', 'POST', { name, icon: 'leaf', color: 'green', ...extra })
  const mark = (user: User, id: string, date: string, day = today()) =>
    send<HabitDto>(user, `/api/habits/${id}/marks/${date}`, 'PUT', undefined, { today: day })
  const unmark = (user: User, id: string, date: string, day = today()) =>
    send<HabitDto>(user, `/api/habits/${id}/marks/${date}`, 'DELETE', undefined, { today: day })

  describe('crud', () => {
    it('creates a daily habit by default and appends it to the end', async () => {
      const user = await registerUser()
      const first = await addHabit(user, 'Медитация')
      const second = await addHabit(user, 'Зал', { perWeek: 3 })

      expect(first).toMatchObject({ name: 'Медитация', perWeek: null, sortOrder: 0, marks: [] })
      expect(second).toMatchObject({ perWeek: 3, sortOrder: 1 })
      expect((await habits(user)).map(el => el.name)).toEqual(['Медитация', 'Зал'])
    })

    it('edits a habit and switches it back to daily', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Зал', { perWeek: 3 })

      const edited = await send<HabitDto>(user, `/api/habits/${habit.id}`, 'PATCH', { name: 'Бег', color: 'blue', perWeek: null })

      expect(edited).toMatchObject({ name: 'Бег', color: 'blue', perWeek: null })
    })

    it('rejects icons, colors and frequencies outside the sets', async () => {
      const user = await registerUser()

      await expect(addHabit(user, 'X', { icon: 'rocket' })).rejects.toMatchObject({ statusCode: 400 })
      await expect(addHabit(user, 'X', { color: '#fff' })).rejects.toMatchObject({ statusCode: 400 })
      await expect(addHabit(user, 'X', { perWeek: 7 })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('moves a deleted habit to the trash and restores it with its marks', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      await mark(user, habit.id, today())

      await send(user, `/api/habits/${habit.id}`, 'DELETE')

      expect(await habits(user)).toEqual([])
      expect((await get<TrashDto>(user, '/api/trash')).habits.map(el => el.id)).toEqual([habit.id])
      await expect(send(user, `/api/habits/${habit.id}`, 'DELETE')).rejects.toMatchObject({ statusCode: 404 })
      await expect(send(user, `/api/habits/${habit.id}`, 'PATCH', { name: 'X' })).rejects.toMatchObject({ statusCode: 404 })

      const restored = await send<HabitDto>(user, `/api/habits/${habit.id}/restore`, 'POST')

      expect(restored.marks).toEqual([today()])
      expect((await habits(user)).map(el => el.id)).toEqual([habit.id])
    })

    it('keeps other users out', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const habit = await addHabit(owner, 'Медитация')

      expect(await habits(stranger)).toEqual([])
      await expect(send(stranger, `/api/habits/${habit.id}`, 'PATCH', { name: 'X' })).rejects.toMatchObject({ statusCode: 404 })
      await expect(send(stranger, `/api/habits/${habit.id}`, 'DELETE')).rejects.toMatchObject({ statusCode: 404 })
      await expect(mark(stranger, habit.id, today())).rejects.toMatchObject({ statusCode: 404 })

      await send(owner, `/api/habits/${habit.id}`, 'DELETE')

      await expect(send(stranger, `/api/habits/${habit.id}/restore`, 'POST')).rejects.toMatchObject({ statusCode: 404 })
    })

    it('rejects anonymous requests', async () => {
      await expect($fetch('/api/habits')).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('marks', () => {
    it('marks and unmarks a day, a repeated mark stays single', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      const yesterday = shiftDay(today(), -1)

      await mark(user, habit.id, yesterday)
      await mark(user, habit.id, today())
      const twice = await mark(user, habit.id, today())

      expect(twice.marks).toEqual([yesterday, today()])
      expect((await unmark(user, habit.id, yesterday)).marks).toEqual([today()])
      expect((await habits(user))[0]!.marks).toEqual([today()])
    })

    it('accepts the last seven days only', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')

      expect((await mark(user, habit.id, shiftDay(today(), -6))).marks).toHaveLength(1)
      await expect(mark(user, habit.id, shiftDay(today(), -7))).rejects.toMatchObject({ statusCode: 400 })
      await expect(mark(user, habit.id, shiftDay(today(), 1))).rejects.toMatchObject({ statusCode: 400 })
      await expect(unmark(user, habit.id, shiftDay(today(), -7))).rejects.toMatchObject({ statusCode: 400 })
    })

    it('does not trust a client «today» more than a day away from the server', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      const farFuture = shiftDay(today(), 3)

      await expect(mark(user, habit.id, farFuture, farFuture)).rejects.toMatchObject({ statusCode: 400 })
      await expect(send(user, `/api/habits/${habit.id}/marks/${today()}`, 'PUT')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a timestamp instead of a calendar day', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')

      await expect(mark(user, habit.id, `${today()}T00:00:00.000Z`)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('does not mark a deleted habit', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      await send(user, `/api/habits/${habit.id}`, 'DELETE')

      await expect(mark(user, habit.id, today())).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('order', () => {
    it('saves a new order', async () => {
      const user = await registerUser()
      const a = await addHabit(user, 'A')
      const b = await addHabit(user, 'B')
      const c = await addHabit(user, 'C')

      await send(user, '/api/habits/order', 'PUT', { ids: [c.id, a.id, b.id] })

      expect((await habits(user)).map(el => el.name)).toEqual(['C', 'A', 'B'])
    })

    it('refuses ids of another user or of deleted habits', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const mine = await addHabit(owner, 'Мой')
      const deleted = await addHabit(owner, 'Удалённый')
      const theirs = await addHabit(stranger, 'Чужой')
      await send(owner, `/api/habits/${deleted.id}`, 'DELETE')

      await expect(send(owner, '/api/habits/order', 'PUT', { ids: [theirs.id, mine.id] })).rejects.toMatchObject({ statusCode: 400 })
      await expect(send(owner, '/api/habits/order', 'PUT', { ids: [deleted.id, mine.id] })).rejects.toMatchObject({ statusCode: 400 })
      expect((await prisma.habit.findUniqueOrThrow({ where: { id: theirs.id } })).sortOrder).toBe(0)
    })
  })

  describe('trash', () => {
    it('deletes a habit forever together with its marks', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      await mark(user, habit.id, today())
      await send(user, `/api/habits/${habit.id}`, 'DELETE')

      await send(user, `/api/trash/habit/${habit.id}`, 'DELETE')

      expect(await prisma.habit.findUnique({ where: { id: habit.id } })).toBeNull()
      expect(await prisma.habitMark.count({ where: { habitId: habit.id } })).toBe(0)
    })

    it('counts habits when emptying the trash', async () => {
      const user = await registerUser()
      const habit = await addHabit(user, 'Медитация')
      await send(user, `/api/habits/${habit.id}`, 'DELETE')

      const result = await send<{ deleted: number }>(user, '/api/trash', 'DELETE')

      expect(result.deleted).toBe(1)
      expect((await get<TrashDto>(user, '/api/trash')).habits).toEqual([])
    })

    it('purges habits older than 30 days and refuses to restore them', async () => {
      const user = await registerUser()
      const old = await addHabit(user, 'Старая')
      const recent = await addHabit(user, 'Свежая')
      await send(user, `/api/habits/${old.id}`, 'DELETE')
      await send(user, `/api/habits/${recent.id}`, 'DELETE')
      await prisma.habit.update({ where: { id: old.id }, data: { deletedAt: new Date(Date.now() - 31 * DAY_MS) } })

      await expect(send(user, `/api/habits/${old.id}/restore`, 'POST')).rejects.toMatchObject({ statusCode: 404 })
      expect((await get<TrashDto>(user, '/api/trash')).habits.map(el => el.id)).toEqual([recent.id])
      expect(await prisma.habit.findUnique({ where: { id: old.id } })).toBeNull()
    })
  })

  describe('settings', () => {
    it('shows habits on Today by default and lets the user turn it off', async () => {
      const user = await registerUser()
      const stored = () => prisma.appSettings.findUniqueOrThrow({ where: { userId: user.userId } })

      expect((await stored()).habitsOnToday).toBe(true)

      const settings = await send<{ habitsOnToday: boolean }>(user, '/api/settings', 'PATCH', { habitsOnToday: false })

      expect(settings.habitsOnToday).toBe(false)
      expect((await stored()).habitsOnToday).toBe(false)
    })
  })
})
