import type { SavingsCache, TransactionCache } from '../../../app/utils/financeCache'
import type { SavingsEntryItem, SavingsResponse, SummaryResponse, TransactionItem, TransactionListResponse } from '../../../shared/types'
import { describe, expect, it } from 'vitest'
import { cachedTransactions, dropFromSummary, dropSavingsEntry, dropTransaction } from '../../../app/utils/financeCache'

function tx(id: string, overrides: Partial<TransactionItem> = {}): TransactionItem {
  return {
    id,
    userId: 'user-1',
    type: 'EXPENSE',
    amount: 100,
    categoryId: 'cat-1',
    note: null,
    date: new Date('2026-05-08'),
    createdAt: new Date('2026-05-08'),
    updatedAt: new Date('2026-05-08'),
    ...overrides
  } as TransactionItem
}

function page(data: TransactionItem[], total = data.length, pageNumber = 1): TransactionListResponse {
  return { data, total, page: pageNumber, limit: 30 }
}

function infinite(...pages: TransactionListResponse[]): TransactionCache {
  return { pages, pageParams: pages.map((_, index) => index + 1) }
}

function entry(id: string, type: 'DEPOSIT' | 'WITHDRAWAL', amount: number): SavingsEntryItem {
  return {
    id,
    userId: 'user-1',
    type,
    amount,
    note: null,
    createdAt: new Date('2026-05-08')
  } as SavingsEntryItem
}

function savings(entries: SavingsEntryItem[], balance: number, delta: number): SavingsResponse {
  return { balance, delta, entries, total: entries.length, page: 1, limit: 20 }
}

describe('cachedTransactions', () => {
  it('разворачивает обе формы кэша и пустоту', () => {
    expect(cachedTransactions(undefined)).toEqual([])
    expect(cachedTransactions(page([tx('a')]))).toHaveLength(1)
    expect(cachedTransactions(infinite(page([tx('a')]), page([tx('b')])))).toHaveLength(2)
  })
})

describe('dropTransaction', () => {
  it('убирает транзакцию из плоского списка и уменьшает total', () => {
    const next = dropTransaction(page([tx('a'), tx('b')], 7), 'a') as TransactionListResponse

    expect(next.data.map(item => item.id)).toEqual(['b'])
    expect(next.total).toBe(6)
  })

  it('уменьшает total на всех страницах, а не только на той, где лежала транзакция', () => {
    const cache = infinite(page([tx('a')], 3, 1), page([tx('b'), tx('c')], 3, 2))

    const next = dropTransaction(cache, 'c') as { pages: TransactionListResponse[] }

    expect(next.pages.map(p => p.total)).toEqual([2, 2])
    expect(next.pages[1]!.data.map(item => item.id)).toEqual(['b'])
  })

  it('возвращает ту же ссылку, если транзакции в кэше нет', () => {
    const cache = infinite(page([tx('a')]))

    expect(dropTransaction(cache, 'missing')).toBe(cache)
  })
})

describe('dropFromSummary', () => {
  const summary: SummaryResponse = {
    income: 1000,
    expense: 400,
    networth: 600,
    breakdown: [
      { total: 300, category: { id: 'cat-1', name: 'Food', icon: 'i', color: '#fff' } },
      { total: 100, category: { id: 'cat-2', name: 'Fun', icon: 'i', color: '#000' } }
    ]
  }

  it('вычитает расход из expense, категории и пересчитывает networth', () => {
    const next = dropFromSummary(summary, tx('a', { type: 'EXPENSE', amount: 250, categoryId: 'cat-1' }))

    expect(next.expense).toBe(150)
    expect(next.income).toBe(1000)
    expect(next.networth).toBe(850)
    expect(next.breakdown.map(item => item.total)).toEqual([100, 50])
  })

  it('убирает категорию из breakdown, когда её расходы обнулились', () => {
    const next = dropFromSummary(summary, tx('a', { type: 'EXPENSE', amount: 100, categoryId: 'cat-2' }))

    expect(next.breakdown.map(item => item.category.id)).toEqual(['cat-1'])
  })

  it('доход не трогает breakdown, который считается только по расходам', () => {
    const next = dropFromSummary(summary, tx('a', { type: 'INCOME', amount: 200 }))

    expect(next.income).toBe(800)
    expect(next.expense).toBe(400)
    expect(next.networth).toBe(400)
    expect(next.breakdown).toBe(summary.breakdown)
  })
})

describe('dropSavingsEntry', () => {
  const cache: SavingsCache = {
    pages: [savings([entry('s-1', 'DEPOSIT', 500), entry('s-2', 'WITHDRAWAL', 200)], 1000, 300)],
    pageParams: [1]
  }

  it('снятый депозит уменьшает баланс и дельту', () => {
    const next = dropSavingsEntry(cache, 's-1')

    expect(next.pages[0]!.balance).toBe(500)
    expect(next.pages[0]!.delta).toBe(-200)
    expect(next.pages[0]!.total).toBe(1)
    expect(next.pages[0]!.entries.map(item => item.id)).toEqual(['s-2'])
  })

  it('снятое списание возвращает деньги в баланс', () => {
    const next = dropSavingsEntry(cache, 's-2')

    expect(next.pages[0]!.balance).toBe(1200)
    expect(next.pages[0]!.delta).toBe(500)
  })

  it('возвращает ту же ссылку, если записи в кэше нет', () => {
    expect(dropSavingsEntry(cache, 'missing')).toBe(cache)
  })
})
