import { describe, expect, it } from 'vitest'
import {
  emptyFilters,
  filterKey,
  filterQuery,
  hasActiveFilters
} from '../../../app/utils/transactionFilters'

describe('emptyFilters / hasActiveFilters', () => {
  it('пустые фильтры не считаются активными', () => {
    expect(hasActiveFilters(emptyFilters())).toBe(false)
  })

  it('любой заполненный фильтр делает набор активным', () => {
    expect(hasActiveFilters({ ...emptyFilters(), type: 'INCOME' })).toBe(true)
    expect(hasActiveFilters({ ...emptyFilters(), categoryIds: ['cat-1'] })).toBe(true)
    expect(hasActiveFilters({ ...emptyFilters(), search: 'кофе' })).toBe(true)
    expect(hasActiveFilters({ ...emptyFilters(), mine: true })).toBe(true)
  })
})

describe('filterQuery', () => {
  it('не отправляет пустые параметры — "all" это отсутствие type', () => {
    expect(filterQuery(emptyFilters())).toEqual({})
  })

  it('склеивает категории в CSV, как ждёт transactionQuerySchema', () => {
    expect(filterQuery({ type: 'EXPENSE', categoryIds: ['cat-1', 'cat-2'], search: 'такси', mine: false }))
      .toEqual({ type: 'EXPENSE', categoryIds: 'cat-1,cat-2', search: 'такси' })
  })

  it('шлёт mine только когда чип «Только мои» включён', () => {
    expect(filterQuery({ ...emptyFilters(), mine: true })).toEqual({ mine: 'true' })
  })
})

describe('filterKey', () => {
  it('не зависит от порядка выбора категорий — иначе кэш дублировался бы', () => {
    expect(filterKey({ ...emptyFilters(), categoryIds: ['b', 'a'] }))
      .toBe(filterKey({ ...emptyFilters(), categoryIds: ['a', 'b'] }))
  })

  it('различает разные наборы фильтров', () => {
    expect(filterKey(emptyFilters())).not.toBe(filterKey({ ...emptyFilters(), type: 'EXPENSE' }))
    expect(filterKey({ ...emptyFilters(), search: 'кофе' }))
      .not.toBe(filterKey({ ...emptyFilters(), search: 'кино' }))
    expect(filterKey(emptyFilters())).not.toBe(filterKey({ ...emptyFilters(), mine: true }))
  })
})
