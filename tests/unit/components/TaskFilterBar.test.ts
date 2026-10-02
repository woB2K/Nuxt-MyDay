import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TaskFilterBar from '../../../app/components/features/tasks/TaskFilterBar.vue'
import UiPillSelect from '../../../app/components/ui/UiPillSelect.vue'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

const SEARCH_DEBOUNCE = 300

function mountBar(props: { filter?: 'all' | 'open' | 'done', search?: string } = {}) {
  return mount(TaskFilterBar, {
    props: { filter: 'all', search: '', ...props },
    global: { components: { UiPillSelect }, stubs: { UIcon: true } }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('taskFilterBar', () => {
  it('не дёргает запрос на каждый символ — ждёт паузу', async () => {
    const wrapper = mountBar()

    await wrapper.find('input').setValue('отч')
    vi.advanceTimersByTime(SEARCH_DEBOUNCE - 50)
    expect(wrapper.emitted('update:search')).toBeUndefined()

    await wrapper.find('input').setValue('отчёт')
    vi.advanceTimersByTime(SEARCH_DEBOUNCE)

    expect(wrapper.emitted('update:search')).toEqual([['отчёт']])
  })

  it('крестик очищает поиск', async () => {
    const wrapper = mountBar({ search: 'отчёт' })

    await wrapper.find('button[type="button"]').trigger('click')
    vi.advanceTimersByTime(SEARCH_DEBOUNCE)

    expect(wrapper.emitted('update:search')).toEqual([['']])
  })

  it('переключает фильтр сразу, без задержки', async () => {
    const wrapper = mountBar()

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('update:filter')).toEqual([['open']])
  })

  it('подхватывает сброс фильтров снаружи', async () => {
    const wrapper = mountBar({ search: 'отчёт' })

    await wrapper.setProps({ search: '' })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
