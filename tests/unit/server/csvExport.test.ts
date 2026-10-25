import { describe, expect, it } from 'vitest'
import { parseImport } from '../../../app/utils/csvImport'
import { categoryName, EXPORT_HEADER, exportAmount, safeText, toCsv } from '../../../server/utils/csvExport'

describe('toCsv', () => {
  it('ставит BOM, экранирует кавычки, запятые и переносы', () => {
    expect(toCsv([['a', 'b,c'], ['say "hi"', 'x\ny']])).toBe('﻿a,"b,c"\r\n"say ""hi""","x\ny"\r\n')
  })
})

describe('safeText', () => {
  it('не даёт Excel принять заметку за формулу', () => {
    expect(safeText('=HYPERLINK("x")')).toBe('\'=HYPERLINK("x")')
    expect(safeText('-5 за кофе')).toBe('\'-5 за кофе')
    expect(safeText('кофе')).toBe('кофе')
  })
})

describe('categoryName', () => {
  it('переводит сидовую категорию на язык выгрузки, свою оставляет как есть', () => {
    const names = { food: 'Еда и напитки' }

    expect(categoryName({ name: 'Food & Drink', key: 'food' }, names)).toBe('Еда и напитки')
    expect(categoryName({ name: 'Хобби', key: null }, names)).toBe('Хобби')
    expect(categoryName({ name: 'Custom', key: 'gone' }, names)).toBe('Custom')
  })
})

describe('exportAmount', () => {
  it('пишет сумму без лишних нулей', () => {
    expect(exportAmount(150)).toBe('150')
    expect(exportAmount(99.9)).toBe('99.9')
  })
})

describe('выгрузка читается импортом', () => {
  it('всё, что выгрузили, импорт разбирает обратно без потерь', () => {
    const csv = toCsv([
      EXPORT_HEADER,
      ['2026-10-01', 'expense', '1250.4', 'RUB', 'Еда и напитки', 'обед, работа', '=опасная заметка', 'Анна'].map(safeText),
      ['2026-10-02', 'income', '60000', 'RUB', 'Зарплата', '', '', 'Борис'].map(safeText)
    ])

    const parsed = parseImport(csv.replace(/^\uFEFF/, ''))!

    expect(parsed.source).toBe('myday')
    expect(parsed.skipped).toEqual([])
    expect(parsed.rows.map(({ date, type, amount, category, tags, notes, currency }) => ({ date, type, amount, category, tags, notes, currency }))).toEqual([
      { date: '2026-10-01', type: 'EXPENSE', amount: 1250.4, category: 'Еда и напитки', tags: ['обед', 'работа'], notes: '=опасная заметка', currency: 'RUB' },
      { date: '2026-10-02', type: 'INCOME', amount: 60000, category: 'Зарплата', tags: [], notes: '', currency: 'RUB' }
    ])
  })
})
