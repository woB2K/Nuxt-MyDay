import type { z } from 'zod'
import type { Habit } from '~~/prisma/.generated/prisma'
import type { createHabitSchema, habitColorSchema, habitIconSchema, updateHabitSchema } from '../schemas/habit'

export type CreateHabitInput = z.input<typeof createHabitSchema>
export type UpdateHabitInput = z.input<typeof updateHabitSchema>
export type HabitIcon = z.infer<typeof habitIconSchema>
export type HabitColor = z.infer<typeof habitColorSchema>

export type HabitItem = Omit<Habit, 'icon' | 'color'> & {
  icon: HabitIcon
  color: HabitColor
  marks: string[]
}
