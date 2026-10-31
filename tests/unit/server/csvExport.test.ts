import { describe, expect, it } from 'vitest'
import { categoryName, exportAmount, safeText, toCsv } from '../../../server/utils/csvExport'

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
