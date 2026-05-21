import { z } from 'zod'

const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE'])
const savingTypeEnum = z.enum(['DEPOSIT', 'WITHDRAWAL'])

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive(),
  notes: z.string().optional(),
  categoryId: z.string().min(1),
  date: z.iso.datetime()
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const createCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
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
