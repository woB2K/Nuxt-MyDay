import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTasksStore } from '../../../app/stores/tasks'
import { taskQuery } from '../../../app/utils/taskFilters'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useTasksStore', () => {
  it('стартует со всеми задачами и пустым поиском', () => {
    const store = useTasksStore()

    expect(store.activeFilter).toBe('all')
    expect(store.searchQuery).toBe('')
    expect(store.filtersActive).toBe(false)
    expect(taskQuery(store.activeFilter, store.searchQuery)).toEqual({})
  })

  it('считает фильтры активными при выборе сегмента или вводе поиска', () => {
    const store = useTasksStore()

    store.activeFilter = 'open'
    expect(store.filtersActive).toBe(true)

    store.activeFilter = 'all'
    store.searchQuery = 'отчёт'
    expect(store.filtersActive).toBe(true)
  })

  it('сбрасывает фильтр и поиск одним вызовом', () => {
    const store = useTasksStore()

    store.activeFilter = 'done'
    store.searchQuery = 'отчёт'
    store.resetFilters()

    expect(store.activeFilter).toBe('all')
    expect(store.searchQuery).toBe('')
    expect(store.filtersActive).toBe(false)
  })
})
