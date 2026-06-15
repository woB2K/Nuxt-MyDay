import { describe, expect, it } from 'vitest'
import { createBudgetSchema, createCategorySchema, createSavingsSchema, createTransactionSchema, updateBudgetSchema, updateTransactionSchema } from '../../../shared/schemas/finance'

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
  it('accepts name and type', () => {
    const result = createCategorySchema.safeParse({ name: 'Food', type: 'EXPENSE' })
    expect(result.success).toBe(true)
  })

  it('accepts name, type and icon', () => {
    const result = createCategorySchema.safeParse({ name: 'Food', type: 'EXPENSE', icon: '🍔' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ name: '', type: 'EXPENSE' })
    expect(result.success).toBe(false)
  })

  it('rejects missing type', () => {
    const result = createCategorySchema.safeParse({ name: 'Food' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = createCategorySchema.safeParse({ name: 'Food', type: 'TRANSFER' })
    expect(result.success).toBe(false)
  })
})

describe('createSavingsSchema', () => {
  const valid = {
    amount: 5000,
    type: 'DEPOSIT'
  }

  it('accepts valid deposit', () => {
    const result = createSavingsSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts both DEPOSIT and WITHDRAWAL types', () => {
    expect(createSavingsSchema.safeParse({ ...valid, type: 'DEPOSIT' }).success).toBe(true)
    expect(createSavingsSchema.safeParse({ ...valid, type: 'WITHDRAWAL' }).success).toBe(true)
  })

  it('rejects negative amount', () => {
    const result = createSavingsSchema.safeParse({ ...valid, amount: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid savings type', () => {
    const result = createSavingsSchema.safeParse({ ...valid, type: 'INCOME' })
    expect(result.success).toBe(false)
  })

  it('accepts optional notes', () => {
    const result = createSavingsSchema.safeParse({ ...valid, notes: 'Emergency fund' })
    expect(result.success).toBe(true)
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

describe('updateBudgetSchema', () => {
  it('accepts empty object', () => {
    const result = updateBudgetSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update of amount only', () => {
    const result = updateBudgetSchema.safeParse({ amount: 30000 })
    expect(result.success).toBe(true)
  })

  it('still rejects invalid amount if provided', () => {
    const result = updateBudgetSchema.safeParse({ amount: -1 })
    expect(result.success).toBe(false)
  })
})
