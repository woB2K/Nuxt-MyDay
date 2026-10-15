import type { HabitColor, HabitIcon, HabitItem } from '~~/shared/types'
import { dayNumber, shiftDay, weekdayIndex, weekStart } from '~~/shared/calendarDay'
import { HABIT_MARK_WINDOW_DAYS } from '~~/shared/schemas'
import { toDateString } from './formatDate'
import { monthEnd, monthStart } from './period'

export const defaultHabitIcon: HabitIcon = 'leaf'
export const defaultHabitColor: HabitColor = 'violet'
export const defaultPerWeek = 3

const RATE_DAYS = 30
const PLAN_WEEKS = 4
const RECORD_FROM = 3

type HabitHistory = Pick<HabitItem, 'marks' | 'perWeek' | 'createdAt'>

export interface HabitStreaks {
  current: number
  best: number
}

export interface HabitStats extends HabitStreaks {
  doneToday: boolean
  weekly: boolean
  weekCount: number
  need: number
  planDone: boolean
  atRisk: boolean
  active: boolean
  broken: boolean
  record: boolean
}

export interface HabitRing {
  segments: number
  filled: number
  checked: boolean
}

export interface HabitFx {
  type: 'on' | 'off' | 'record' | 'wave'
  key: number
  delay?: number
}

export interface WeekDot {
  date: string
  marked: boolean
  today: boolean
  weekStart: boolean
}

export interface HabitsProgress {
  weekly: boolean
  done: number
  total: number
  all: boolean
}

export type CalendarDayState = 'done' | 'open' | 'missed' | 'inactive'

export interface CalendarDay {
  date: string
  day: number
  state: CalendarDayState
  today: boolean
}

export interface CalendarWeekSummary {
  count: number
  ok: boolean
  current: boolean
}

export interface CalendarWeek {
  days: (CalendarDay | null)[]
  summary: CalendarWeekSummary | null
}

export function habitColor(color: HabitColor): string {
  return `var(--c-h-${color})`
}

export function habitSoft(color: HabitColor): string {
  return `var(--c-h-${color}-soft)`
}

export function habitIconName(icon: HabitIcon): string {
  return `i-lucide-${icon}`
}

export function isMarked(habit: Pick<HabitItem, 'marks'>, date: string): boolean {
  return habit.marks.includes(date)
}

export function habitStartDay(habit: Pick<HabitItem, 'marks' | 'createdAt'>): string {
  const created = toDateString(new Date(habit.createdAt))

  return habit.marks.reduce((first, mark) => (mark < first ? mark : first), created)
}

function weekCounts(marks: string[]): Map<string, number> {
  const counts = new Map<string, number>()

  marks.forEach((mark) => {
    const week = weekStart(mark)
    counts.set(week, (counts.get(week) ?? 0) + 1)
  })

  return counts
}

export function weekCount(habit: Pick<HabitItem, 'marks'>, today: string): number {
  const week = weekStart(today)

  return habit.marks.filter(mark => weekStart(mark) === week).length
}

function dailyCurrent(marks: string[], today: string): number {
  const days = new Set(marks)
  let cursor = days.has(today) ? today : shiftDay(today, -1)
  let count = 0

  while (days.has(cursor)) {
    count += 1
    cursor = shiftDay(cursor, -1)
  }

  return count
}

function dailyBest(marks: string[]): number {
  let best = 0
  let run = 0
  let previous: number | null = null

  for (const mark of [...new Set(marks)].sort()) {
    const day = dayNumber(mark)
    run = previous !== null && day - previous === 1 ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }

  return best
}

function weeklyStreaks(habit: HabitHistory, perWeek: number, today: string): HabitStreaks {
  const counts = weekCounts(habit.marks)
  const first = weekStart(habitStartDay(habit))
  const current = weekStart(today)
  let run = 0
  let best = 0

  for (let week = first; week <= current; week = shiftDay(week, 7)) {
    const count = counts.get(week) ?? 0
    run = week === current || week === first || count >= perWeek ? run + count : 0
    best = Math.max(best, run)
  }

  return { current: run, best }
}

export function habitStreaks(habit: HabitHistory, today: string): HabitStreaks {
  if (habit.perWeek === null) return { current: dailyCurrent(habit.marks, today), best: dailyBest(habit.marks) }

  return weeklyStreaks(habit, habit.perWeek, today)
}

export function habitStats(habit: HabitHistory, today: string): HabitStats {
  const { current, best } = habitStreaks(habit, today)
  const doneToday = isMarked(habit, today)
  const shared = {
    current,
    best,
    doneToday,
    broken: !doneToday && current === 0 && best > 0,
    record: current >= RECORD_FROM && current === best
  }

  if (habit.perWeek === null) {
    return {
      ...shared,
      weekly: false,
      weekCount: 0,
      need: 0,
      planDone: false,
      atRisk: !doneToday && current > 0,
      active: doneToday
    }
  }

  const count = weekCount(habit, today)
  const need = Math.max(0, habit.perWeek - count)
  const available = 7 - weekdayIndex(today) - (doneToday ? 1 : 0)
  const planDone = count >= habit.perWeek

  return {
    ...shared,
    weekly: true,
    weekCount: count,
    need,
    planDone,
    atRisk: current > 0 && need > 0 && need === available,
    active: doneToday || planDone
  }
}

export function isNewRecord(before: HabitHistory, after: HabitHistory, today: string): boolean {
  const previous = habitStreaks(before, today).best

  return previous >= RECORD_FROM && habitStreaks(after, today).best > previous
}

export function markRate(habit: Pick<HabitItem, 'marks' | 'createdAt'>, today: string): number {
  const days = Math.min(RATE_DAYS, Math.max(1, dayNumber(today) - dayNumber(habitStartDay(habit)) + 1))
  const from = shiftDay(today, 1 - days)
  const count = habit.marks.filter(mark => mark >= from && mark <= today).length

  return Math.round((count / days) * 100)
}

export function weeksOnPlan(habit: HabitHistory, today: string): { ok: number, total: number } {
  const counts = weekCounts(habit.marks)
  const first = weekStart(habitStartDay(habit))
  const perWeek = habit.perWeek ?? 7
  let ok = 0
  let total = 0

  for (let back = 1; back <= PLAN_WEEKS; back += 1) {
    const week = shiftDay(weekStart(today), -7 * back)
    if (week <= first) break

    total += 1
    if ((counts.get(week) ?? 0) >= perWeek) ok += 1
  }

  return { ok, total }
}

export function habitRing(habit: Pick<HabitItem, 'marks' | 'perWeek'>, today: string): HabitRing {
  const checked = isMarked(habit, today)

  if (habit.perWeek === null) return { segments: 1, filled: checked ? 1 : 0, checked }

  return { segments: habit.perWeek, filled: Math.min(weekCount(habit, today), habit.perWeek), checked }
}

export function markWindow(today: string): string[] {
  return Array.from({ length: HABIT_MARK_WINDOW_DAYS }, (_, index) =>
    shiftDay(today, index - HABIT_MARK_WINDOW_DAYS + 1))
}

export function canMark(date: string, today: string): boolean {
  return date <= today && date >= shiftDay(today, 1 - HABIT_MARK_WINDOW_DAYS)
}

export function weekDots(habit: Pick<HabitItem, 'marks'>, today: string): WeekDot[] {
  return markWindow(today).map(date => ({
    date,
    marked: isMarked(habit, date),
    today: date === today,
    weekStart: weekdayIndex(date) === 0
  }))
}

export function habitsProgress(habits: Pick<HabitItem, 'marks' | 'perWeek'>[], today: string): HabitsProgress {
  const daily = habits.filter(habit => habit.perWeek === null)
  const weekly = daily.length === 0
  const pool = weekly ? habits : daily
  const done = pool.filter(habit => weekly
    ? weekCount(habit, today) >= (habit.perWeek ?? 0)
    : isMarked(habit, today)).length

  return { weekly, done, total: pool.length, all: pool.length > 0 && done === pool.length }
}

export function monthWeeks(habit: HabitHistory, month: string, today: string): CalendarWeek[] {
  const first = monthStart(month)
  const last = monthEnd(first)
  const start = habitStartDay(habit)
  const counts = weekCounts(habit.marks)
  const slots = Array.from<CalendarDay | null>({ length: weekdayIndex(first) }).fill(null)

  for (let date = first; date <= last; date = shiftDay(date, 1)) {
    const markable = canMark(date, today)
    const inactive = date > today || (date < start && !markable)
    const state: CalendarDayState = inactive
      ? 'inactive'
      : isMarked(habit, date) ? 'done' : markable ? 'open' : 'missed'

    slots.push({ date, day: Number(date.slice(8)), state, today: date === today })
  }

  while (slots.length % 7) slots.push(null)

  const weeks: CalendarWeek[] = []

  for (let index = 0; index < slots.length; index += 7) {
    const days = slots.slice(index, index + 7)
    const week = weekStart(days.find(Boolean)!.date)
    const visible = habit.perWeek !== null && week <= weekStart(today) && week >= weekStart(start)
    const count = counts.get(week) ?? 0

    weeks.push({
      days,
      summary: visible ? { count, ok: count >= habit.perWeek!, current: week === weekStart(today) } : null
    })
  }

  return weeks
}

export function withMark(habit: HabitItem, date: string, marked: boolean): HabitItem {
  const rest = habit.marks.filter(mark => mark !== date)

  return { ...habit, marks: marked ? [...rest, date].sort() : rest }
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items

  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)

  return next
}

export function orderHabits(habits: HabitItem[], ids: string[]): HabitItem[] {
  const position = new Map(ids.map((id, index) => [id, index]))
  const rank = (habit: HabitItem) => position.get(habit.id) ?? Number.MAX_SAFE_INTEGER

  return [...habits]
    .sort((a, b) => rank(a) - rank(b))
    .map((habit, index) => ({ ...habit, sortOrder: index }))
}
