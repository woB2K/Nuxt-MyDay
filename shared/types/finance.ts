import type { z } from 'zod'
import type { createBudgetSchema, createCategorySchema, createTransactionSchema, updateCategorySchema, updateTransactionSchema } from '../schemas/finance'

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
