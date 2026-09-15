import type { InfiniteData } from '@tanstack/vue-query'
import type { SavingsResponse, SummaryResponse, TransactionItem, TransactionListResponse } from '~~/shared/types'

export type TransactionCache = TransactionListResponse | InfiniteData<TransactionListResponse>
export type SavingsCache = InfiniteData<SavingsResponse>

export function cachedTransactions(cache: TransactionCache | undefined): TransactionItem[] {
  if (!cache) return []

  return 'pages' in cache ? cache.pages.flatMap(page => page.data) : cache.data
}

export function dropTransaction(cache: TransactionCache, id: string): TransactionCache {
  if (!cachedTransactions(cache).some(transaction => transaction.id === id)) return cache

  if (!('pages' in cache)) {
    return { ...cache, data: cache.data.filter(transaction => transaction.id !== id), total: cache.total - 1 }
  }

  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.filter(transaction => transaction.id !== id),
      total: page.total - 1
    }))
  }
}

export function dropFromSummary(summary: SummaryResponse, transaction: TransactionItem): SummaryResponse {
  const income = transaction.type === 'INCOME' ? summary.income - transaction.amount : summary.income
  const expense = transaction.type === 'EXPENSE' ? summary.expense - transaction.amount : summary.expense

  const breakdown = transaction.type === 'INCOME'
    ? summary.breakdown
    : summary.breakdown
        .map(item => item.category.id === transaction.categoryId
          ? { ...item, total: item.total - transaction.amount }
          : item)
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total)

  return { income, expense, networth: income - expense, breakdown }
}

export function dropSavingsEntry(cache: SavingsCache, id: string): SavingsCache {
  const entry = cache.pages.flatMap(page => page.entries).find(item => item.id === id)

  if (!entry) return cache

  const shift = entry.type === 'DEPOSIT' ? -entry.amount : entry.amount

  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      entries: page.entries.filter(item => item.id !== id),
      balance: page.balance + shift,
      delta: page.delta + shift,
      total: page.total - 1
    }))
  }
}
