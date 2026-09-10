import { z } from 'zod'

const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE'])
const savingTypeEnum = z.enum(['DEPOSIT', 'WITHDRAWAL'])

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive(),
  notes: z.string().optional(),
  categoryId: z.string().min(1),
  date: z.iso.date()
})

export const updateTransactionSchema = createTransactionSchema.partial()

const dateRangeShape = {
  from: z.iso.date().optional(),
  to: z.iso.date().optional()
}

const isOrderedRange = (q: { from?: string, to?: string }) => !q.from || !q.to || q.from <= q.to
const orderedRangeError = { message: 'from must be before or equal to to', path: ['from'] }

export const dateRangeQuerySchema = z.object(dateRangeShape).refine(isOrderedRange, orderedRangeError)

export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>

const transactionFilterShape = {
  ...dateRangeShape,
  type: transactionTypeEnum.optional(),
  search: z.string().max(100).optional().transform(s => s?.trim() || undefined),
  categoryIds: z.string().optional()
    .transform(s => s?.split(',').map(id => id.trim()).filter(Boolean))
}

export const transactionFilterQuerySchema = z.object(transactionFilterShape).refine(isOrderedRange, orderedRangeError)

export type TransactionFilterQuery = z.infer<typeof transactionFilterQuerySchema>

const paginationShape = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
}

export const transactionQuerySchema = z.object({
  ...transactionFilterShape,
  ...paginationShape
}).refine(isOrderedRange, orderedRangeError)

export type TransactionQuery = z.infer<typeof transactionQuerySchema>

export const savingsQuerySchema = z.object({
  ...dateRangeShape,
  ...paginationShape
}).refine(isOrderedRange, orderedRangeError)

export type SavingsQuery = z.infer<typeof savingsQuerySchema>

export const createCategorySchema = z.object({
  name: z.string().min(1).max(60),
  icon: z.string().min(1),
  color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i),
  type: transactionTypeEnum
})

export const updateCategorySchema = createCategorySchema.partial()

export const createBudgetSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  month: z.iso.datetime()
})

export const updateBudgetSchema = createBudgetSchema.partial()

export const createSavingsSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().optional(),
  type: savingTypeEnum
})
