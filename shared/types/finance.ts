import type { z } from 'zod'
import type { Budget, FinanceTag, SavingsEntry, SavingsGoal, Transaction } from '~~/prisma/.generated/prisma'
import type { createBudgetSchema, createCategorySchema, createFinanceTagSchema, createSavingsGoalSchema, createSavingsSchema, createTransactionSchema, importTransactionsSchema, updateBudgetSchema, updateCategorySchema, updateFinanceTagSchema, updateSavingsGoalSchema, updateSavingsSchema, updateTransactionSchema } from '../schemas/finance'

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type ImportTransactionsInput = z.input<typeof importTransactionsSchema>

export interface ImportTransactionsResult {
  created: number
  existing: number
  categories: number
  tags: number
}
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateSavingsSchema = z.infer<typeof createSavingsSchema>
export type UpdateSavingsInput = z.infer<typeof updateSavingsSchema>
export type CreateFinanceTagInput = z.infer<typeof createFinanceTagSchema>
export type UpdateFinanceTagInput = z.infer<typeof updateFinanceTagSchema>
export type FinanceTagItem = FinanceTag
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>
export type SavingsGoalItem = Omit<SavingsGoal, 'target'> & { target: number, saved: number }

type WithNumberAmount<T extends { amount: unknown }> = Omit<T, 'amount'> & { amount: number }

export type TransactionItem = WithNumberAmount<Transaction> & { tagIds: string[] }
export interface TransactionListResponse {
  data: TransactionItem[]
  total: number
  page: number
  limit: number
}

export type SavingsEntryItem = WithNumberAmount<SavingsEntry>
export interface SavingsResponse {
  balance: number
  delta: number
  opening: number | null
  entries: SavingsEntryItem[]
  total: number
  page: number
  limit: number
}

export type BudgetItem = WithNumberAmount<Budget>

export interface CategoryInfo {
  id: string
  name: string
  key: string | null
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
  /** По какому типу транзакций посчитан breakdown: INCOME при фильтре «Доходы», иначе EXPENSE */
  breakdownType: Transaction['type']
  breakdown: SummaryBreakdownItem[]
}
