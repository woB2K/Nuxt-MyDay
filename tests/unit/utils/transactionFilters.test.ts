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
  })
})

describe('filterQuery', () => {
  it('не отправляет пустые параметры — "all" это отсутствие type', () => {
    expect(filterQuery(emptyFilters())).toEqual({})
  })

  it('склеивает категории в CSV, как ждёт transactionQuerySchema', () => {
    expect(filterQuery({ type: 'EXPENSE', categoryIds: ['cat-1', 'cat-2'], search: 'такси' }))
      .toEqual({ type: 'EXPENSE', categoryIds: 'cat-1,cat-2', search: 'такси' })
  })
})

describe('filterKey', () => {
  it('не зависит от порядка выбора категорий — иначе кэш дублировался бы', () => {
    expect(filterKey({ type: 'all', categoryIds: ['b', 'a'], search: '' }))
      .toBe(filterKey({ type: 'all', categoryIds: ['a', 'b'], search: '' }))
  })

  it('различает разные наборы фильтров', () => {
    expect(filterKey(emptyFilters())).not.toBe(filterKey({ ...emptyFilters(), type: 'EXPENSE' }))
    expect(filterKey({ ...emptyFilters(), search: 'кофе' }))
      .not.toBe(filterKey({ ...emptyFilters(), search: 'кино' }))
  })
})
