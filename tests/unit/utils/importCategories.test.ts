import type { ImportRow } from '../../../app/utils/csvImport'
import { describe, expect, it } from 'vitest'
import { importBatches, importPayload, matchImportCategories, summarizeImport } from '../../../app/utils/importCategories'

function row(category: string, extra: Partial<ImportRow> = {}): ImportRow {
  return { line: 2, date: '2026-10-01', type: 'EXPENSE', amount: 100, category, notes: '', tags: [], currency: 'RUB', fingerprint: `${category}-${Math.random()}`, ...extra }
}

const categories = [
  { id: 'food', name: 'Food & Drink', key: 'food', type: 'EXPENSE' as const },
  { id: 'cafe', name: 'Кафе', key: null, type: 'EXPENSE' as const },
  { id: 'other', name: 'Other', key: 'other-expense', type: 'EXPENSE' as const, isSystem: true },
  { id: 'salary', name: 'Salary', key: 'salary', type: 'INCOME' as const }
]
const labels: Record<string, string> = { food: 'Еда', salary: 'Зарплата' }
const label = (category: { name: string, key?: string | null }) => (category.key && labels[category.key]) || category.name

describe('matchImportCategories', () => {
  it('сопоставляет по имени и по переводу сидовой категории без учёта регистра, пустую — с системной', () => {
    const choices = matchImportCategories([row('еда'), row('КАФЕ'), row(''), row('Зарплата', { type: 'INCOME' }), row('Хобби'), row('Хобби')], categories, label)

    expect(choices.map(({ name, match, rows }) => ({ name, match, rows }))).toEqual([
      { name: 'Хобби', match: null, rows: 2 },
      { name: 'еда', match: 'food', rows: 1 },
      { name: 'КАФЕ', match: 'cafe', rows: 1 },
      { name: '', match: 'other', rows: 1 },
      { name: 'Зарплата', match: 'salary', rows: 1 }
    ])
  })

  it('не путает одноимённые категории расхода и дохода', () => {
    expect(matchImportCategories([row('Salary')], categories, label)[0]!.match).toBeNull()
  })
})

describe('importPayload', () => {
  it('шлёт id выбранной категории или имя новой, пустое имя — запасным', () => {
    const rows = [row('Хобби', { notes: 'краски', tags: ['арт'] }), row('еда'), row('', { type: 'INCOME' })]
    const choices = matchImportCategories(rows, categories, label)

    expect(importPayload(rows, choices, 'Без категории')).toEqual([
      expect.objectContaining({ categoryName: 'Хобби', notes: 'краски', tags: ['арт'] }),
      expect.objectContaining({ categoryId: 'food' }),
      expect.objectContaining({ categoryName: 'Без категории', type: 'INCOME' })
    ])
  })
})

describe('importBatches', () => {
  it('режет на пачки заданного размера', () => {
    expect(importBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})

describe('summarizeImport', () => {
  it('даёт период и валюты файла', () => {
    expect(summarizeImport([row('a', { date: '2026-10-05', currency: 'USD' }), row('b', { date: '2025-01-02' })])).toEqual({ from: '2025-01-02', to: '2026-10-05', currencies: ['USD', 'RUB'] })
    expect(summarizeImport([])).toBeNull()
  })
})
