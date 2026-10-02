import type { TaskItem } from '../../../shared/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  completionStreak,
  doneTodayCount,
  focusTask,
  sortTasks,
  todayTasks
} from '../../../app/utils/taskStats'

function task(id: string, overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id,
    userId: 'user-1',
    title: `Task ${id}`,
    notes: null,
    done: false,
    doneAt: null,
    priority: 'NONE',
    dueDate: null,
    createdAt: new Date(2026, 8, 1, 10, 0),
    updatedAt: new Date(2026, 8, 1, 10, 0),
    tags: [],
    ...overrides
  }
}

function doneAt(year: number, month: number, day: number): Partial<TaskItem> {
  return { done: true, doneAt: new Date(year, month, day, 21, 30) }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 14, 23, 40))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('todayTasks', () => {
  it('берёт задачи без дедлайна, на сегодня и просроченные', () => {
    const tasks = [
      task('no-date'),
      task('due-today', { dueDate: new Date(2026, 8, 14, 9, 0) }),
      task('overdue', { dueDate: new Date(2026, 8, 10, 9, 0) }),
      task('later', { dueDate: new Date(2026, 8, 20, 9, 0) })
    ]

    expect(todayTasks(tasks).map(el => el.id)).toEqual(['no-date', 'due-today', 'overdue'])
  })

  it('оставляет выполненные сегодня и убирает вчерашние', () => {
    const tasks = [
      task('done-today', doneAt(2026, 8, 14)),
      task('done-yesterday', doneAt(2026, 8, 13))
    ]

    expect(todayTasks(tasks).map(el => el.id)).toEqual(['done-today'])
  })
})

describe('doneTodayCount', () => {
  it('считает только сегодняшние завершения', () => {
    const tasks = [
      task('a', doneAt(2026, 8, 14)),
      task('b', doneAt(2026, 8, 14)),
      task('c', doneAt(2026, 8, 13)),
      task('d')
    ]

    expect(doneTodayCount(tasks)).toBe(2)
  })
})

describe('completionStreak', () => {
  it('считает подряд идущие дни с завершёнными задачами', () => {
    const tasks = [
      task('a', doneAt(2026, 8, 14)),
      task('b', doneAt(2026, 8, 13)),
      task('c', doneAt(2026, 8, 12))
    ]

    expect(completionStreak(tasks)).toBe(3)
  })

  it('не обнуляет серию, пока сегодняшний день не закончился', () => {
    const tasks = [
      task('a', doneAt(2026, 8, 13)),
      task('b', doneAt(2026, 8, 12))
    ]

    expect(completionStreak(tasks)).toBe(2)
  })

  it('обрывается на пропущенном дне', () => {
    const tasks = [
      task('a', doneAt(2026, 8, 14)),
      task('c', doneAt(2026, 8, 11))
    ]

    expect(completionStreak(tasks)).toBe(1)
  })

  it('не считает несколько задач одного дня за несколько дней', () => {
    const tasks = [
      task('a', doneAt(2026, 8, 14)),
      task('b', doneAt(2026, 8, 14))
    ]

    expect(completionStreak(tasks)).toBe(1)
  })

  it('отдаёт ноль, когда завершений нет', () => {
    expect(completionStreak([task('a')])).toBe(0)
  })
})

describe('sortTasks', () => {
  it('опускает выполненные вниз', () => {
    const tasks = [task('done', { ...doneAt(2026, 8, 14), priority: 'HIGH' }), task('open')]

    expect(sortTasks(tasks).map(el => el.id)).toEqual(['open', 'done'])
  })

  it('сортирует по приоритету, затем по дедлайну', () => {
    const tasks = [
      task('low', { priority: 'LOW' }),
      task('high', { priority: 'HIGH' }),
      task('medium-late', { priority: 'MEDIUM', dueDate: new Date(2026, 8, 20) }),
      task('medium-soon', { priority: 'MEDIUM', dueDate: new Date(2026, 8, 15) })
    ]

    expect(sortTasks(tasks).map(el => el.id))
      .toEqual(['high', 'medium-soon', 'medium-late', 'low'])
  })

  it('ставит задачи без дедлайна после задач с дедлайном', () => {
    const tasks = [task('no-date'), task('dated', { dueDate: new Date(2026, 8, 20) })]

    expect(sortTasks(tasks).map(el => el.id)).toEqual(['dated', 'no-date'])
  })

  it('не мутирует исходный массив', () => {
    const tasks = [task('b', { priority: 'LOW' }), task('a', { priority: 'HIGH' })]

    sortTasks(tasks)

    expect(tasks.map(el => el.id)).toEqual(['b', 'a'])
  })
})

describe('focusTask', () => {
  it('выбирает самую срочную незавершённую задачу', () => {
    const tasks = [
      task('done', { ...doneAt(2026, 8, 14), priority: 'HIGH' }),
      task('low', { priority: 'LOW' }),
      task('urgent', { priority: 'HIGH' })
    ]

    expect(focusTask(tasks)?.id).toBe('urgent')
  })

  it('отдаёт null, когда всё выполнено', () => {
    expect(focusTask([task('a', doneAt(2026, 8, 14))])).toBeNull()
  })
})
