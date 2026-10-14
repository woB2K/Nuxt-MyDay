import { z } from 'zod'

export const MAX_TRANSACTION_TAGS = 10
export const MAX_AMOUNT = 9_999_999_999.99
export const MAX_NOTES_LENGTH = 500
export const MAX_NAME_LENGTH = 60

const amount = z.number().positive().max(MAX_AMOUNT)
const notes = z.string().max(MAX_NOTES_LENGTH)

const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE'])

const idList = z.string().max(2000).optional()
  .transform(s => s?.split(',').map(id => id.trim()).filter(Boolean))
const savingTypeEnum = z.enum(['DEPOSIT', 'WITHDRAWAL', 'OPENING'])

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount,
  notes: notes.optional(),
  categoryId: z.string().min(1),
  date: z.iso.date(),
  tagIds: z.array(z.string().min(1)).max(MAX_TRANSACTION_TAGS).optional()
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
  categoryIds: idList,
  tagIds: idList,
  mine: z.enum(['true', 'false']).optional().transform(s => s === 'true' || undefined)
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
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  icon: z.string().min(1).max(60),
  color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i),
  type: transactionTypeEnum
})

export const updateCategorySchema = createCategorySchema.partial()

export const createBudgetSchema = z.object({
  amount,
  categoryId: z.string().min(1),
  month: z.iso.datetime()
})

export const updateBudgetSchema = createBudgetSchema.partial()

export const createSavingsSchema = z.object({
  amount,
  notes: notes.optional(),
  type: savingTypeEnum,
  goalId: z.string().min(1).nullable().optional()
})

export const updateSavingsSchema = createSavingsSchema.pick({ amount: true, notes: true, goalId: true }).partial()

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  target: amount,
  deadline: z.iso.date().nullable().optional()
})

export const updateSavingsGoalSchema = createSavingsGoalSchema.partial()

export const createFinanceTagSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i).optional()
})

export const updateFinanceTagSchema = createFinanceTagSchema.partial()
