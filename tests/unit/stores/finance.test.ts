import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFinanceStore } from '../../../app/stores/finance'
import { periodRange } from '../../../app/utils/period'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 24, 23, 40))
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useFinanceStore', () => {
  it('стартует с текущего месяца в таймзоне клиента', () => {
    const store = useFinanceStore()

    expect(store.period).toEqual({ mode: 'month', month: '2026-07-01', preset: 'thisMonth' })
    expect(periodRange(store.period)).toEqual({ from: '2026-07-01', to: '2026-07-31' })
  })

  it('хранит выбранный период целиком, включая режим all', () => {
    const store = useFinanceStore()

    store.period = { mode: 'all', preset: 'all' }

    expect(periodRange(store.period)).toBeNull()
  })

  it('стартует без фильтров и сбрасывает их обратно', () => {
    const store = useFinanceStore()

    expect(store.filters).toEqual({ type: 'all', categoryIds: [], tagIds: [], search: '', authorId: null })
    expect(store.filtersActive).toBe(false)

    store.filters = { type: 'EXPENSE', categoryIds: ['cat-1'], tagIds: ['tag-1'], search: 'такси', authorId: 'user-1' }
    expect(store.filtersActive).toBe(true)

    store.resetFilters()
    expect(store.filters).toEqual({ type: 'all', categoryIds: [], tagIds: [], search: '', authorId: null })
    expect(store.filtersActive).toBe(false)
  })

  describe('проваливание в категорию', () => {
    it('ставит фильтр по одной категории и не трогает остальные фильтры', () => {
      const store = useFinanceStore()
      store.filters = { type: 'EXPENSE', categoryIds: ['cat-1', 'cat-2'], tagIds: ['tag-1'], search: '', authorId: null }

      store.drillIntoCategory('cat-3')

      expect(store.filters).toEqual({ type: 'EXPENSE', categoryIds: ['cat-3'], tagIds: ['tag-1'], search: '', authorId: null })
    })

    it('при выходе возвращает категории, которые были до перехода', () => {
      const store = useFinanceStore()
      store.filters = { ...store.filters, categoryIds: ['cat-1'] }

      store.drillIntoCategory('cat-3')
      store.leaveDrill()

      expect(store.filters.categoryIds).toEqual(['cat-1'])
      expect(store.drill).toBeNull()
    })

    it('сохраняет остальные фильтры, изменённые на экране транзакций', () => {
      const store = useFinanceStore()

      store.drillIntoCategory('cat-3')
      store.filters = { ...store.filters, search: 'такси' }
      store.leaveDrill()

      expect(store.filters.categoryIds).toEqual([])
      expect(store.filters.search).toBe('такси')
    })

    it('не трогает категории, если их поменяли вручную', () => {
      const store = useFinanceStore()

      store.drillIntoCategory('cat-3')
      store.filters = { ...store.filters, categoryIds: ['cat-3', 'cat-4'] }
      store.leaveDrill()

      expect(store.filters.categoryIds).toEqual(['cat-3', 'cat-4'])
    })

    it('без перехода выход ничего не меняет', () => {
      const store = useFinanceStore()
      store.filters = { ...store.filters, categoryIds: ['cat-1'] }

      store.leaveDrill()

      expect(store.filters.categoryIds).toEqual(['cat-1'])
    })

    it('сброс фильтров забывает переход', () => {
      const store = useFinanceStore()

      store.drillIntoCategory('cat-3')
      store.resetFilters()
      store.filters = { ...store.filters, categoryIds: ['cat-3'] }
      store.leaveDrill()

      expect(store.filters.categoryIds).toEqual(['cat-3'])
    })
  })
})
