import type { PrismaClient } from '~~/prisma/.generated/prisma'
import type { PushContent, PushPayload } from './messages'
import type { DueReminder, ReminderState } from './plan'
import type { PushSender } from './webPush'
import { shiftDay } from '~~/shared/calendarDay'
import { compareTaskOrder } from '~~/shared/taskOrder'
import { localClock } from './clock'
import { pushMessage, toPushLang } from './messages'
import { dueReminders, FINANCE_KEY, habitKey, TASKS_KEY } from './plan'

export interface TickDeps {
  db: PrismaClient
  send: PushSender
  now: Date
}

export interface TickResult {
  users: number
  pushes: number
}

const MARK_LOOKBACK_DAYS = 7

function utcDay(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function dayDate(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`)
}

export async function deliver(db: PrismaClient, send: PushSender, userId: string, payload: PushPayload): Promise<number> {
  const subscriptions = await db.pushSubscription.findMany({ where: { userId } })
  let delivered = 0

  for (const subscription of subscriptions) {
    const outcome = await send(subscription, payload)

    if (outcome === 'ok') {
      delivered += 1
      await db.pushSubscription.update({ where: { id: subscription.id }, data: { lastSuccessAt: new Date() } })
    } else if (outcome === 'gone') {
      await db.pushSubscription.deleteMany({ where: { id: subscription.id } })
    }
  }

  return delivered
}

async function financeContent(db: PrismaClient, userId: string, today: string): Promise<PushContent> {
  const groups = await db.transaction.groupBy({
    by: ['type'],
    where: { userId, deletedAt: null, date: dayDate(today) },
    _count: { _all: true },
    _sum: { amount: true }
  })

  const count = groups.reduce((total, group) => total + group._count._all, 0)
  const expense = groups.find(group => group.type === 'EXPENSE')?._sum.amount?.toNumber() ?? 0

  return { kind: 'finance', count, expense }
}

async function tasksContent(db: PrismaClient, userId: string, today: string): Promise<PushContent> {
  const tasks = await db.task.findMany({
    where: { userId, done: false, deletedAt: null, OR: [{ dueDate: null }, { dueDate: { lte: dayDate(today) } }] },
    select: { title: true, priority: true, dueDate: true, createdAt: true }
  })

  const ordered = tasks
    .map(task => ({ title: task.title, key: { done: false, priority: task.priority, dueDay: task.dueDate ? utcDay(task.dueDate) : null, createdAt: task.createdAt.getTime() } }))
    .sort((a, b) => compareTaskOrder(a.key, b.key))

  return {
    kind: 'tasks',
    count: ordered.length,
    overdue: ordered.filter(task => task.key.dueDay !== null && task.key.dueDay < today).length,
    first: ordered[0]?.title ?? null
  }
}

async function claim(db: PrismaClient, userId: string, keys: string[], today: string): Promise<Set<string>> {
  const claimed = await db.notificationLog.createManyAndReturn({
    data: keys.map(key => ({ userId, key, localDate: dayDate(today) })),
    skipDuplicates: true,
    select: { key: true }
  })

  return new Set(claimed.map(row => row.key))
}

function keysOf(reminder: DueReminder): string[] {
  if (reminder.kind === 'finance') return [FINANCE_KEY]
  if (reminder.kind === 'tasks') return [TASKS_KEY]

  return reminder.habits.map(habit => habitKey(habit.id))
}

export async function runNotificationTick({ db, send, now }: TickDeps): Promise<TickResult> {
  const users = await db.appSettings.findMany({
    where: {
      user: { pushSubscriptions: { some: {} } },
      OR: [
        { remindFinanceAt: { not: null } },
        { remindTasksAt: { not: null } },
        { user: { habits: { some: { deletedAt: null, reminderAt: { not: null } } } } }
      ]
    },
    select: { userId: true, lang: true, hideAmounts: true, timezone: true, remindFinanceAt: true, remindTasksAt: true }
  })

  let pushes = 0

  for (const settings of users) {
    try {
      pushes += await remindUser(db, send, now, settings)
    } catch (error) {
      console.error('[push] reminders failed for user', settings.userId, error)
    }
  }

  return { users: users.length, pushes }
}

interface UserReminderSettings {
  userId: string
  lang: string
  hideAmounts: boolean
  timezone: string
  remindFinanceAt: string | null
  remindTasksAt: string | null
}

async function remindUser(db: PrismaClient, send: PushSender, now: Date, settings: UserReminderSettings): Promise<number> {
  let pushes = 0

  const clock = localClock(now, settings.timezone)
  const today = clock.date

  const [habits, logs] = await Promise.all([
    db.habit.findMany({
      where: { userId: settings.userId, deletedAt: null, reminderAt: { not: null } },
      select: {
        id: true,
        name: true,
        reminderAt: true,
        perWeek: true,
        marks: { where: { date: { gte: dayDate(shiftDay(today, -MARK_LOOKBACK_DAYS)) } }, select: { date: true } }
      }
    }),
    db.notificationLog.findMany({ where: { userId: settings.userId, localDate: dayDate(today) }, select: { key: true } })
  ])

  const state: ReminderState = {
    remindFinanceAt: settings.remindFinanceAt,
    remindTasksAt: settings.remindTasksAt,
    habits: habits.map(habit => ({
      id: habit.id,
      name: habit.name,
      reminderAt: habit.reminderAt!,
      perWeek: habit.perWeek,
      marks: habit.marks.map(mark => utcDay(mark.date))
    })),
    sentKeys: new Set(logs.map(log => log.key))
  }

  const lang = toPushLang(settings.lang)

  for (const reminder of dueReminders(state, clock)) {
    const claimed = await claim(db, settings.userId, keysOf(reminder), today)

    if (claimed.size === 0) continue

    let content: PushContent

    if (reminder.kind === 'finance') content = await financeContent(db, settings.userId, today)
    else if (reminder.kind === 'tasks') content = await tasksContent(db, settings.userId, today)
    else content = { kind: 'habits', names: reminder.habits.filter(habit => claimed.has(habitKey(habit.id))).map(habit => habit.name) }

    await deliver(db, send, settings.userId, pushMessage(content, lang, settings.hideAmounts))
    pushes += 1
  }

  return pushes
}
