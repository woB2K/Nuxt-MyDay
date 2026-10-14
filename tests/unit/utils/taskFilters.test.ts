import { describe, expect, it } from 'vitest'
import { defaultTaskFilter, hasActiveTaskFilters, taskFilterKeys, taskQuery } from '../../../app/utils/taskFilters'

describe('defaultTaskFilter', () => {
  it('по умолчанию показывает только открытые задачи', () => {
    expect(defaultTaskFilter).toBe('open')
  })
})

describe('hasActiveTaskFilters', () => {
  it('стартовое состояние не считается активным фильтром', () => {
    expect(hasActiveTaskFilters(defaultTaskFilter, '')).toBe(false)
  })

  it('отличие от стартового сегмента или поиск делают набор активным', () => {
    expect(hasActiveTaskFilters('all', '')).toBe(true)
    expect(hasActiveTaskFilters('done', '')).toBe(true)
    expect(hasActiveTaskFilters('open', 'отчёт')).toBe(true)
  })
})

describe('taskQuery', () => {
  it('не отправляет пустые параметры — "all" это отсутствие filter', () => {
    expect(taskQuery('all', '')).toEqual({})
  })

  it('отдаёт значения, которые понимает GET /api/tasks', () => {
    expect(taskQuery('open', 'отчёт')).toEqual({ filter: 'open', search: 'отчёт' })
    expect(taskQuery('done', '')).toEqual({ filter: 'done' })
    expect(taskQuery('all', 'отчёт')).toEqual({ search: 'отчёт' })
  })
})

describe('taskFilterKeys', () => {
  it('перечисляет фильтры в порядке сегментов All / Open / Done', () => {
    expect(taskFilterKeys).toEqual(['all', 'open', 'done'])
  })
})
