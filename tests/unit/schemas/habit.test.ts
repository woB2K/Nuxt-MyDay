import { describe, expect, it } from 'vitest'
import {
  createHabitSchema,
  habitMarkParamsSchema,
  habitOrderSchema,
  MAX_HABITS_ORDER,
  updateHabitSchema
} from '../../../shared/schemas/habit'
import { updateSettingsSchema } from '../../../shared/schemas/settings'

const valid = { name: '  Медитация  ', icon: 'leaf', color: 'green' }

describe('createHabitSchema', () => {
  it('trims the name and makes the habit daily by default', () => {
    expect(createHabitSchema.parse(valid)).toEqual({ name: 'Медитация', icon: 'leaf', color: 'green', perWeek: null })
  })

  it('accepts 1 to 6 times a week', () => {
    expect(createHabitSchema.safeParse({ ...valid, perWeek: 1 }).success).toBe(true)
    expect(createHabitSchema.safeParse({ ...valid, perWeek: 6 }).success).toBe(true)
  })

  it('rejects 0 and 7 times a week — 7 is just a daily habit', () => {
    expect(createHabitSchema.safeParse({ ...valid, perWeek: 0 }).success).toBe(false)
    expect(createHabitSchema.safeParse({ ...valid, perWeek: 7 }).success).toBe(false)
    expect(createHabitSchema.safeParse({ ...valid, perWeek: 2.5 }).success).toBe(false)
  })

  it('rejects an empty name and icons or colors outside the sets', () => {
    expect(createHabitSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false)
    expect(createHabitSchema.safeParse({ ...valid, icon: 'i-lucide-leaf' }).success).toBe(false)
    expect(createHabitSchema.safeParse({ ...valid, color: '#34D399' }).success).toBe(false)
  })
})

describe('updateHabitSchema', () => {
  it('accepts a partial update and switching back to daily', () => {
    expect(updateHabitSchema.safeParse({ perWeek: null }).success).toBe(true)
    expect(updateHabitSchema.safeParse({ color: 'blue' }).success).toBe(true)
  })

  it('rejects an empty body', () => {
    expect(updateHabitSchema.safeParse({}).success).toBe(false)
  })
})

describe('habitMarkParamsSchema', () => {
  it('takes a calendar day, not a timestamp', () => {
    expect(habitMarkParamsSchema.safeParse({ id: 'h-1', date: '2026-10-15' }).success).toBe(true)
    expect(habitMarkParamsSchema.safeParse({ id: 'h-1', date: '2026-10-15T00:00:00.000Z' }).success).toBe(false)
  })
})

describe('habitOrderSchema', () => {
  it('needs at least one id and caps the list', () => {
    expect(habitOrderSchema.safeParse({ ids: [] }).success).toBe(false)
    expect(habitOrderSchema.safeParse({ ids: Array.from({ length: MAX_HABITS_ORDER + 1 }, (_, i) => `h-${i}`) }).success).toBe(false)
  })
})

describe('updateSettingsSchema — habitsOnToday', () => {
  it('accepts the toggle on its own', () => {
    expect(updateSettingsSchema.safeParse({ habitsOnToday: false }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ habitsOnToday: 'no' }).success).toBe(false)
  })
})
