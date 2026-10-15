import { z } from 'zod'
import { MAX_NAME_LENGTH } from './finance'

export const HABIT_MARK_WINDOW_DAYS = 7
export const MIN_PER_WEEK = 1
export const MAX_PER_WEEK = 6
export const MAX_HABITS_ORDER = 200

export const habitIcons = [
  'leaf',
  'dumbbell',
  'biceps-flexed',
  'book-open',
  'droplet',
  'footprints',
  'sun',
  'moon',
  'apple',
  'pen-line',
  'music',
  'heart',
  'ban',
  'bike'
] as const

export const habitColors = ['red', 'amber', 'green', 'teal', 'blue', 'violet', 'pink', 'orange'] as const

export const habitIconSchema = z.enum(habitIcons)
export const habitColorSchema = z.enum(habitColors)
export const perWeekSchema = z.number().int().min(MIN_PER_WEEK).max(MAX_PER_WEEK).nullable()

const habitFields = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  icon: habitIconSchema,
  color: habitColorSchema,
  perWeek: perWeekSchema
})

export const createHabitSchema = habitFields.extend({
  perWeek: perWeekSchema.default(null)
})

export const updateHabitSchema = habitFields.partial()
  .refine(body => Object.keys(body).length > 0, { message: 'Nothing to update' })

export const habitMarkParamsSchema = z.object({
  id: z.string().min(1),
  date: z.iso.date()
})

export const habitMarkTodaySchema = z.object({
  today: z.iso.date()
})

export const habitOrderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(MAX_HABITS_ORDER)
})
