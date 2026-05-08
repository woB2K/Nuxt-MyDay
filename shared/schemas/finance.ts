import { z } from 'zod'

const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE'])

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  notes: z.string().optional(),
  date: z.iso.datetime()
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const createCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export const createBudgetSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  month: z.iso.datetime()
})
