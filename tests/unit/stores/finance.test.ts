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
})
