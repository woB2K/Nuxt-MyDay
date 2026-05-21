import type { z } from 'zod'
import type { createBudgetSchema, createCategorySchema, createTransactionSchema, updateBudgetSchema, updateCategorySchema, updateTransactionSchema } from '../schemas/finance'

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateSavingsSchema = z.infer<typeof createBudgetSchema>
