import type { TaskItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FocusCard from '../../../app/components/features/tasks/FocusCard.vue'
import UiCheckCircle from '../../../app/components/ui/UiCheckCircle.vue'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

function task(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 't-1',
    userId: 'user-1',
    title: 'Сдать отчёт',
    notes: null,
    done: false,
    doneAt: null,
    priority: 'NONE',
    dueDate: null,
    createdAt: new Date('2026-09-14T09:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z'),
    tags: [],
    ...overrides
  }
}

function mountCard(item: TaskItem = task()) {
  return mount(FocusCard, {
    props: { task: item },
    global: { components: { UiCheckCircle }, stubs: { UIcon: true } }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 14, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('focusCard', () => {
  it('отмечает задачу выполненной, не открывая её', async () => {
    const wrapper = mountCard()

    await wrapper.findComponent(UiCheckCircle).trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([[true]])
    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('тап по карточке открывает задачу', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('показывает приоритет и прячет подпись, когда его нет', () => {
    expect(mountCard(task({ priority: 'HIGH' })).text()).toContain('tasks.priority.HIGH')
    expect(mountCard().text()).not.toContain('tasks.priority')
  })

  it('подсвечивает просроченный дедлайн', () => {
    const wrapper = mountCard(task({ dueDate: new Date('2026-09-13T09:00:00.000Z') }))

    expect(wrapper.find('.text-danger').exists()).toBe(true)
  })
})
