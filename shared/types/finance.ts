import type { z } from 'zod'
import type { Budget, SavingsEntry, Transaction } from '~~/prisma/.generated/prisma'
import type { createBudgetSchema, createCategorySchema, createTransactionSchema, updateBudgetSchema, updateCategorySchema, updateTransactionSchema } from '../schemas/finance'

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateSavingsSchema = z.infer<typeof createBudgetSchema>

type WithNumberAmount<T extends { amount: unknown }> = Omit<T, 'amount'> & { amount: number }

export type TransactionItem = WithNumberAmount<Transaction>
export interface TransactionListResponse {
  data: TransactionItem[]
  total: number
  page: number
  limit: number
}

export type SavingsEntryItem = WithNumberAmount<SavingsEntry>
export interface SavingsResponse {
  balance: number
  thisMonth: number
  entries: SavingsEntryItem[]
}

export type BudgetItem = WithNumberAmount<Budget>

export interface CategoryInfo {
  id: string
  name: string
  icon: string
  color: string
}

export interface SummaryBreakdownItem {
  total: number
  category: CategoryInfo
}

export interface SummaryResponse {
  income: number
  expense: number
  networth: number
  breakdown: SummaryBreakdownItem[]
}
