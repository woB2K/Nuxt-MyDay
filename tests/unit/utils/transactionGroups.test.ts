import type { TransactionItem } from '../../../shared/types'
import { describe, expect, it } from 'vitest'
import { groupByDay } from '../../../app/utils/transactionGroups'

function tx(id: string, date: string, type: 'INCOME' | 'EXPENSE', amount: number): TransactionItem {
  return { id, date, type, amount } as unknown as TransactionItem
}

describe('groupByDay', () => {
  it('группирует по календарному дню и сохраняет порядок сервера', () => {
    const groups = groupByDay([
      tx('1', '2026-07-24T00:00:00.000Z', 'EXPENSE', 15),
      tx('2', '2026-07-24T00:00:00.000Z', 'EXPENSE', 86),
      tx('3', '2026-07-23T00:00:00.000Z', 'EXPENSE', 22)
    ])

    expect(groups.map(g => g.day)).toEqual(['2026-07-24', '2026-07-23'])
    expect(groups[0]!.items).toHaveLength(2)
  })

  it('берёт день из строки, не пересчитывая её в локальную зону', () => {
    // @db.Date приходит как UTC-полночь: в UTC−7 локальные геттеры дали бы 23-е.
    const groups = groupByDay([tx('1', '2026-07-24T00:00:00.000Z', 'EXPENSE', 10)])

    expect(groups[0]!.day).toBe('2026-07-24')
  })

  it('считает дневной net: доходы минус расходы', () => {
    const groups = groupByDay([
      tx('1', '2026-07-24', 'INCOME', 1000),
      tx('2', '2026-07-24', 'EXPENSE', 250),
      tx('3', '2026-07-23', 'EXPENSE', 40)
    ])

    expect(groups[0]!.net).toBe(750)
    expect(groups[1]!.net).toBe(-40)
  })

  it('возвращает пустой список для пустого набора', () => {
    expect(groupByDay([])).toEqual([])
  })
})
