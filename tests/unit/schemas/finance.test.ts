import { describe, expect, it } from 'vitest'
import { createBudgetSchema, createCategorySchema, createTransactionSchema, updateTransactionSchema } from '../../../shared/schemas/finance'

describe('createTransactionSchema', () => {
  const valid = {
    type: 'EXPENSE',
    amount: 150.5,
    categoryId: 'clx123',
    date: '2026-05-08T00:00:00.000Z'
  }

  it('accepts valid input', () => {
    const result = createTransactionSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects negative amount', () => {
    const result = createTransactionSchema.safeParse({ ...valid, amount: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const result = createTransactionSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects string amount', () => {
    const result = createTransactionSchema.safeParse({ ...valid, amount: '150' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid transaction type', () => {
    const result = createTransactionSchema.safeParse({ ...valid, type: 'TRANSFER' })
    expect(result.success).toBe(false)
  })

  it('accepts both INCOME and EXPENSE types', () => {
    expect(createTransactionSchema.safeParse({ ...valid, type: 'INCOME' }).success).toBe(true)
    expect(createTransactionSchema.safeParse({ ...valid, type: 'EXPENSE' }).success).toBe(true)
  })

  it('rejects empty categoryId', () => {
    const result = createTransactionSchema.safeParse({ ...valid, categoryId: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional notes', () => {
    const result = createTransactionSchema.safeParse({ ...valid, notes: 'Lunch' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid date format', () => {
    const result = createTransactionSchema.safeParse({ ...valid, date: '2026-05-08' })
    expect(result.success).toBe(false)
  })
})

describe('updateTransactionSchema', () => {
  it('accepts empty object', () => {
    const result = updateTransactionSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('still rejects invalid amount if provided', () => {
    const result = updateTransactionSchema.safeParse({ amount: -50 })
    expect(result.success).toBe(false)
  })
})

describe('createCategorySchema', () => {
  it('accepts name only', () => {
    const result = createCategorySchema.safeParse({ name: 'Food' })
    expect(result.success).toBe(true)
  })

  it('accepts name with icon', () => {
    const result = createCategorySchema.safeParse({ name: 'Food', icon: '🍔' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })
})

describe('createBudgetSchema', () => {
  const valid = {
    amount: 20000,
    categoryId: 'clx123',
    month: '2026-05-01T00:00:00.000Z'
  }

  it('accepts valid input', () => {
    const result = createBudgetSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects negative amount', () => {
    const result = createBudgetSchema.safeParse({ ...valid, amount: -1000 })
    expect(result.success).toBe(false)
  })

  it('rejects empty categoryId', () => {
    const result = createBudgetSchema.safeParse({ ...valid, categoryId: '' })
    expect(result.success).toBe(false)
  })
})
