import type { HabitReminderState, ReminderState } from '../../../server/utils/notifications/plan'
import { describe, expect, it } from 'vitest'
import { inReminderWindow, localClock } from '../../../server/utils/notifications/clock'
import { pushMessage } from '../../../server/utils/notifications/messages'
import { dueReminders } from '../../../server/utils/notifications/plan'

const at = (date: string, minutes: number) => ({ date, minutes })

function state(patch: Partial<ReminderState> = {}): ReminderState {
  return { remindFinanceAt: null, remindTasksAt: null, habits: [], sentKeys: new Set(), ...patch }
}

function habit(patch: Partial<HabitReminderState> = {}): HabitReminderState {
  return { id: 'h1', name: 'Спорт', reminderAt: '08:00', perWeek: null, marks: [], ...patch }
}

describe('localClock', () => {
  it('reads the wall clock of the user zone, not of the server', () => {
    const now = new Date('2026-11-26T18:30:00Z')

    expect(localClock(now, 'UTC')).toEqual({ date: '2026-11-26', minutes: 18 * 60 + 30 })
    expect(localClock(now, 'Europe/Moscow')).toEqual({ date: '2026-11-26', minutes: 21 * 60 + 30 })
  })

  it('moves to the next or previous day across zones far from UTC', () => {
    const now = new Date('2026-11-26T12:00:00Z')

    expect(localClock(now, 'Pacific/Kiritimati')).toEqual({ date: '2026-11-27', minutes: 2 * 60 })
    expect(localClock(now, 'Pacific/Honolulu')).toEqual({ date: '2026-11-26', minutes: 2 * 60 })
    expect(localClock(new Date('2026-11-26T05:00:00Z'), 'Pacific/Honolulu').date).toBe('2026-11-25')
  })

  it('falls back to UTC for a zone the runtime does not know', () => {
    expect(localClock(new Date('2026-11-26T10:00:00Z'), 'Mars/Olympus')).toEqual({ date: '2026-11-26', minutes: 600 })
  })
})

describe('inReminderWindow', () => {
  it('opens at the reminder time and stays open for two hours', () => {
    expect(inReminderWindow(20 * 60 + 55, '21:00')).toBe(false)
    expect(inReminderWindow(21 * 60, '21:00')).toBe(true)
    expect(inReminderWindow(22 * 60 + 55, '21:00')).toBe(true)
    expect(inReminderWindow(23 * 60, '21:00')).toBe(false)
  })

  it('never carries over past midnight', () => {
    expect(inReminderWindow(23 * 60 + 55, '23:00')).toBe(true)
    expect(inReminderWindow(0, '23:00')).toBe(false)
    expect(inReminderWindow(30, '23:00')).toBe(false)
  })
})

describe('dueReminders', () => {
  it('sends the spending and task reminders inside their windows', () => {
    const s = state({ remindFinanceAt: '21:00', remindTasksAt: '09:00' })

    expect(dueReminders(s, at('2026-11-26', 21 * 60 + 5))).toEqual([{ kind: 'finance' }])
    expect(dueReminders(s, at('2026-11-26', 9 * 60))).toEqual([{ kind: 'tasks' }])
    expect(dueReminders(s, at('2026-11-26', 15 * 60))).toEqual([])
  })

  it('does not repeat what was already sent today', () => {
    const s = state({ remindFinanceAt: '21:00', sentKeys: new Set(['finance']) })

    expect(dueReminders(s, at('2026-11-26', 21 * 60 + 10))).toEqual([])
  })

  it('skips a reminder that is turned off', () => {
    expect(dueReminders(state(), at('2026-11-26', 21 * 60))).toEqual([])
  })

  it('reminds about a daily habit only until it is checked off today', () => {
    const now = at('2026-11-26', 8 * 60)

    expect(dueReminders(state({ habits: [habit()] }), now)).toEqual([{ kind: 'habits', habits: [{ id: 'h1', name: 'Спорт' }] }])
    expect(dueReminders(state({ habits: [habit({ marks: ['2026-11-26'] })] }), now)).toEqual([])
    expect(dueReminders(state({ habits: [habit({ marks: ['2026-11-25'] })] }), now)).toHaveLength(1)
  })

  it('stays quiet once the weekly target is met, counting from Monday', () => {
    const thursday = at('2026-11-26', 8 * 60)
    const weekly = (marks: string[]) => state({ habits: [habit({ perWeek: 2, marks })] })

    expect(dueReminders(weekly(['2026-11-23', '2026-11-25']), thursday)).toEqual([])
    expect(dueReminders(weekly(['2026-11-22', '2026-11-25']), thursday)).toHaveLength(1)
  })

  it('groups habits due on the same tick into one push and skips the sent ones', () => {
    const s = state({
      habits: [habit(), habit({ id: 'h2', name: 'Чтение' }), habit({ id: 'h3', name: 'Вода' }), habit({ id: 'h4', name: 'Сон', reminderAt: '22:00' })],
      sentKeys: new Set(['habit:h3'])
    })

    expect(dueReminders(s, at('2026-11-26', 8 * 60 + 5))).toEqual([
      { kind: 'habits', habits: [{ id: 'h1', name: 'Спорт' }, { id: 'h2', name: 'Чтение' }] }
    ])
  })
})

describe('pushMessage', () => {
  it('asks to add spending when nothing is in today', () => {
    expect(pushMessage({ kind: 'finance', count: 0, expense: 0 }, 'ru', false)).toMatchObject({
      title: 'Траты за сегодня',
      body: 'Сегодня ни одной траты — не забудь внести',
      url: '/finance?new=transaction'
    })
  })

  it('shows the count and the spent sum, and drops the sum when amounts are hidden', () => {
    const content = { kind: 'finance', count: 3, expense: 1240 } as const

    expect(pushMessage(content, 'ru', false).body).toBe('Сегодня 3 операции · 1 240 ₽ — всё учёл?')
    expect(pushMessage(content, 'ru', true).body).toBe('Сегодня 3 операции — всё учёл?')
    expect(pushMessage({ ...content, count: 1 }, 'en', true).body).toBe('1 operation today — got everything?')
  })

  it('lists the plan for the day with overdue tasks and the first one', () => {
    expect(pushMessage({ kind: 'tasks', count: 4, overdue: 1, first: 'Позвонить в банк' }, 'ru', false).body)
      .toBe('На сегодня 4 задачи, 1 просрочена · первая: Позвонить в банк')
    expect(pushMessage({ kind: 'tasks', count: 5, overdue: 0, first: 'Call the bank' }, 'en', false).body)
      .toBe('5 tasks for today · first: Call the bank')
  })

  it('suggests planning the day when there are no tasks', () => {
    expect(pushMessage({ kind: 'tasks', count: 0, overdue: 0, first: null }, 'ru', false)).toMatchObject({
      body: 'На сегодня пусто — запланируй день',
      url: '/today'
    })
  })

  it('names one habit in the title and lists several in the body', () => {
    expect(pushMessage({ kind: 'habits', names: ['Спорт'] }, 'ru', false)).toMatchObject({ title: 'Пора: Спорт', url: '/habits' })
    expect(pushMessage({ kind: 'habits', names: ['Спорт', 'Чтение'] }, 'ru', false).body).toBe('Не отмечены: Спорт, Чтение')
  })
})
