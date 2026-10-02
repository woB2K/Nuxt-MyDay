import type { TaskItem } from '../../../shared/types'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UiCheckCircle from '../../../app/components/ui/UiCheckCircle.vue'
import UiTaskRow from '../../../app/components/ui/UiTaskRow.vue'

function task(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 't-1',
    userId: 'user-1',
    title: 'Написать отчёт',
    notes: null,
    done: false,
    doneAt: null,
    priority: 'HIGH',
    dueDate: null,
    createdAt: new Date('2026-09-14T09:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z'),
    tags: [],
    ...overrides
  }
}

function mountRow(item: TaskItem = task()) {
  return mount(UiTaskRow, {
    props: { task: item },
    global: { components: { UiCheckCircle } }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 14, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('uiTaskRow', () => {
  it('отдаёт наружу новое состояние чекбокса', async () => {
    const wrapper = mountRow()

    await wrapper.findComponent(UiCheckCircle).trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([[true]])
  })

  it('тап по чекбоксу не открывает задачу', async () => {
    const wrapper = mountRow()

    await wrapper.findComponent(UiCheckCircle).trigger('click')

    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('тап по строке открывает задачу', async () => {
    const wrapper = mountRow()

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('зачёркивает выполненную задачу', () => {
    const wrapper = mountRow(task({ done: true }))

    expect(wrapper.find('span.line-through').exists()).toBe(true)
  })

  it('подсвечивает просроченный дедлайн', () => {
    const overdue = mountRow(task({ dueDate: new Date('2026-09-13T09:00:00.000Z') }))
    const upcoming = mountRow(task({ dueDate: new Date('2026-09-20T09:00:00.000Z') }))

    expect(overdue.find('.text-danger').exists()).toBe(true)
    expect(upcoming.find('.text-danger').exists()).toBe(false)
  })

  it('не подсвечивает дедлайн выполненной задачи', () => {
    const wrapper = mountRow(task({ done: true, dueDate: new Date('2026-09-13T09:00:00.000Z') }))

    expect(wrapper.find('.text-danger').exists()).toBe(false)
  })

  it('показывает теги задачи', () => {
    const wrapper = mountRow(task({
      tags: [{
        id: 'tag-1',
        userId: 'user-1',
        name: 'дом',
        color: null,
        createdAt: new Date('2026-09-14T09:00:00.000Z'),
        updatedAt: new Date('2026-09-14T09:00:00.000Z')
      }]
    }))

    expect(wrapper.text()).toContain('дом')
  })
})
