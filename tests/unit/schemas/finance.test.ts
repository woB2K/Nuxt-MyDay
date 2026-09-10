import { describe, expect, it } from 'vitest'
import { createBudgetSchema, createCategorySchema, createSavingsSchema, createTransactionSchema, dateRangeQuerySchema, transactionQuerySchema, updateBudgetSchema, updateTransactionSchema } from '../../../shared/schemas/finance'

describe('createTransactionSchema', () => {
  const valid = {
    type: 'EXPENSE',
    amount: 150.5,
    categoryId: 'clx123',
    date: '2026-05-08'
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

  it('rejects full ISO datetime (contract is date-only)', () => {
    const result = createTransactionSchema.safeParse({ ...valid, date: '2026-05-08T00:00:00.000Z' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date format', () => {
    expect(createTransactionSchema.safeParse({ ...valid, date: '08.05.2026' }).success).toBe(false)
    expect(createTransactionSchema.safeParse({ ...valid, date: '2026-13-01' }).success).toBe(false)
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

describe('dateRangeQuerySchema', () => {
  it('accepts an empty query (all time)', () => {
    const result = dateRangeQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data).toEqual({})
  })

  it('accepts a valid range and open-ended bounds', () => {
    expect(dateRangeQuerySchema.safeParse({ from: '2026-05-01', to: '2026-05-31' }).success).toBe(true)
    expect(dateRangeQuerySchema.safeParse({ from: '2026-05-01' }).success).toBe(true)
    expect(dateRangeQuerySchema.safeParse({ to: '2026-05-31' }).success).toBe(true)
  })

  it('rejects an inverted range', () => {
    expect(dateRangeQuerySchema.safeParse({ from: '2026-05-31', to: '2026-05-01' }).success).toBe(false)
  })

  it('rejects full ISO datetime', () => {
    expect(dateRangeQuerySchema.safeParse({ from: '2026-05-01T00:00:00.000Z' }).success).toBe(false)
  })
})

describe('transactionQuerySchema', () => {
  it('accepts empty query and applies pagination defaults', () => {
    const result = transactionQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ page: 1, limit: 20 })
  })

  it('leaves from/to undefined when not passed (mode "all")', () => {
    const result = transactionQuerySchema.parse({})
    expect(result.from).toBeUndefined()
    expect(result.to).toBeUndefined()
  })

  it('coerces page and limit from strings', () => {
    const result = transactionQuerySchema.parse({ page: '3', limit: '50' })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
  })

  it('rejects limit above 100', () => {
    expect(transactionQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })

  it('rejects zero and negative page', () => {
    expect(transactionQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(transactionQuerySchema.safeParse({ page: '-1' }).success).toBe(false)
  })

  it('rejects non-numeric page', () => {
    expect(transactionQuerySchema.safeParse({ page: 'abc' }).success).toBe(false)
  })

  it('accepts a valid date range', () => {
    const result = transactionQuerySchema.safeParse({ from: '2026-09-01', to: '2026-09-30' })
    expect(result.success).toBe(true)
  })

  it('rejects from later than to', () => {
    const result = transactionQuerySchema.safeParse({ from: '2026-09-30', to: '2026-09-01' })
    expect(result.success).toBe(false)
  })

  it('accepts equal from and to (single day)', () => {
    expect(transactionQuerySchema.safeParse({ from: '2026-09-10', to: '2026-09-10' }).success).toBe(true)
  })

  it('accepts from without to and to without from', () => {
    expect(transactionQuerySchema.safeParse({ from: '2026-09-01' }).success).toBe(true)
    expect(transactionQuerySchema.safeParse({ to: '2026-09-01' }).success).toBe(true)
  })

  it('rejects full ISO datetime (contract is date-only)', () => {
    expect(transactionQuerySchema.safeParse({ from: '2026-09-01T00:00:00.000Z' }).success).toBe(false)
  })

  it('rejects a malformed date', () => {
    expect(transactionQuerySchema.safeParse({ from: '01-09-2026' }).success).toBe(false)
    expect(transactionQuerySchema.safeParse({ from: '2026-13-01' }).success).toBe(false)
  })

  it('splits categoryIds into an array', () => {
    const result = transactionQuerySchema.parse({ categoryIds: 'clx1,clx2,clx3' })
    expect(result.categoryIds).toEqual(['clx1', 'clx2', 'clx3'])
  })

  it('drops empty segments and trims categoryIds', () => {
    const result = transactionQuerySchema.parse({ categoryIds: 'clx1, ,clx2,' })
    expect(result.categoryIds).toEqual(['clx1', 'clx2'])
  })

  it('returns an empty array for a blank categoryIds value', () => {
    const result = transactionQuerySchema.parse({ categoryIds: '' })
    expect(result.categoryIds).toEqual([])
  })

  it('trims search and turns a blank one into undefined', () => {
    expect(transactionQuerySchema.parse({ search: '  lunch  ' }).search).toBe('lunch')
    expect(transactionQuerySchema.parse({ search: '   ' }).search).toBeUndefined()
  })

  it('rejects overly long search', () => {
    expect(transactionQuerySchema.safeParse({ search: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects an invalid type', () => {
    expect(transactionQuerySchema.safeParse({ type: 'TRANSFER' }).success).toBe(false)
  })
})

describe('createCategorySchema', () => {
  const valid = {
    name: 'Food',
    type: 'EXPENSE',
    icon: 'i-lucide-utensils',
    color: '#FB923C'
  }

  it('accepts valid input', () => {
    expect(createCategorySchema.safeParse(valid).success).toBe(true)
  })

  it('accepts short hex color', () => {
    expect(createCategorySchema.safeParse({ ...valid, color: '#fff' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(createCategorySchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects missing type', () => {
    const { type, ...withoutType } = valid
    expect(type).toBe('EXPENSE')
    expect(createCategorySchema.safeParse(withoutType).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(createCategorySchema.safeParse({ ...valid, type: 'TRANSFER' }).success).toBe(false)
  })

  it('requires icon and color (both NOT NULL in the db)', () => {
    const { icon, ...withoutIcon } = valid
    const { color, ...withoutColor } = valid
    expect(icon).toBeTruthy()
    expect(color).toBeTruthy()
    expect(createCategorySchema.safeParse(withoutIcon).success).toBe(false)
    expect(createCategorySchema.safeParse(withoutColor).success).toBe(false)
  })

  it('rejects a non-hex color', () => {
    expect(createCategorySchema.safeParse({ ...valid, color: 'orange' }).success).toBe(false)
    expect(createCategorySchema.safeParse({ ...valid, color: '#12345' }).success).toBe(false)
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
