import type { LocalClock } from './clock'
import { weekStart } from '~~/shared/calendarDay'
import { inReminderWindow } from './clock'

export interface HabitReminderState {
  id: string
  name: string
  reminderAt: string
  perWeek: number | null
  marks: string[]
}

export interface ReminderState {
  remindFinanceAt: string | null
  remindTasksAt: string | null
  habits: HabitReminderState[]
  sentKeys: ReadonlySet<string>
}

export type DueReminder
  = | { kind: 'finance' }
    | { kind: 'tasks' }
    | { kind: 'habits', habits: { id: string, name: string }[] }

export const FINANCE_KEY = 'finance'
export const TASKS_KEY = 'tasks'

export function habitKey(habitId: string): string {
  return `habit:${habitId}`
}

function habitSettled(habit: HabitReminderState, today: string): boolean {
  if (habit.marks.includes(today)) return true
  if (habit.perWeek === null) return false

  const from = weekStart(today)
  const weekCount = habit.marks.filter(date => date >= from && date <= today).length

  return weekCount >= habit.perWeek
}

export function dueReminders(state: ReminderState, clock: LocalClock): DueReminder[] {
  const due: DueReminder[] = []
  const fresh = (key: string) => !state.sentKeys.has(key)

  if (state.remindFinanceAt && inReminderWindow(clock.minutes, state.remindFinanceAt) && fresh(FINANCE_KEY))
    due.push({ kind: 'finance' })

  if (state.remindTasksAt && inReminderWindow(clock.minutes, state.remindTasksAt) && fresh(TASKS_KEY))
    due.push({ kind: 'tasks' })

  const habits = state.habits
    .filter(habit => inReminderWindow(clock.minutes, habit.reminderAt) && fresh(habitKey(habit.id)) && !habitSettled(habit, clock.date))
    .map(habit => ({ id: habit.id, name: habit.name }))

  if (habits.length > 0) due.push({ kind: 'habits', habits })

  return due
}
