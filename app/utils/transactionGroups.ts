import type { TransactionItem } from '~~/shared/types'
import { toDayKey } from './formatDate'

export interface DayGroup {
  day: string
  net: number
  items: TransactionItem[]
}

export function groupByDay(transactions: TransactionItem[]): DayGroup[] {
  const byDay = new Map<string, TransactionItem[]>()

  for (const transaction of transactions) {
    const day = toDayKey(transaction.date)
    const items = byDay.get(day)

    if (items) items.push(transaction)
    else byDay.set(day, [transaction])
  }

  return [...byDay].map(([day, items]) => ({
    day,
    items,
    net: items.reduce((sum, item) => sum + (item.type === 'INCOME' ? item.amount : -item.amount), 0)
  }))
}
