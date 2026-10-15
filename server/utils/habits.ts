import type { Prisma } from '~~/prisma/.generated/prisma'
import type { HabitColor, HabitIcon, HabitItem } from '~~/shared/types'
import { createError } from 'h3'
import { dayNumber } from '~~/shared/calendarDay'
import { HABIT_MARK_WINDOW_DAYS } from '~~/shared/schemas'

export const habitMarks = {
  marks: { select: { date: true }, orderBy: { date: 'asc' } }
} as const satisfies Prisma.HabitInclude

type HabitWithMarks = Prisma.HabitGetPayload<{ include: typeof habitMarks }>

export function toHabitItem(habit: HabitWithMarks): HabitItem {
  const { marks, ...rest } = habit

  return {
    ...rest,
    icon: rest.icon as HabitIcon,
    color: rest.color as HabitColor,
    marks: marks.map(mark => mark.date.toISOString().slice(0, 10))
  }
}

export function assertMarkWindow(date: string, today: string, now = new Date()): void {
  const serverDay = dayNumber(now.toISOString().slice(0, 10))
  const clientDay = dayNumber(today)

  if (Math.abs(clientDay - serverDay) > 1) throw createError({ statusCode: 400, message: 'Today is out of range' })

  const age = clientDay - dayNumber(date)

  if (age < 0 || age >= HABIT_MARK_WINDOW_DAYS) {
    throw createError({ statusCode: 400, message: 'Date is outside the mark window' })
  }
}

export async function findOwnedHabit(id: string, userId: string) {
  const habit = await prisma.habit.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true }
  })

  if (!habit) throw createError({ statusCode: 404, message: 'Habit not found' })

  return habit
}

export async function loadHabitItem(id: string): Promise<HabitItem> {
  return toHabitItem(await prisma.habit.findUniqueOrThrow({ where: { id }, include: habitMarks }))
}
