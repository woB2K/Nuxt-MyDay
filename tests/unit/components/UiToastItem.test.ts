import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UiToastItem from '../../../app/components/ui/UiToastItem.vue'

function mountToast(props: Record<string, unknown> = {}) {
  return mount(UiToastItem, {
    props: { id: 'toast-1', message: 'Задача удалена', type: 'success', ...props },
    global: { stubs: { UIcon: true } }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('uiToastItem', () => {
  it('без действия показывает только кнопку закрытия', () => {
    const wrapper = mountToast()

    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('показывает кнопку действия с её подписью', () => {
    const wrapper = mountToast({ action: { label: 'Отменить', run: vi.fn() } })

    expect(wrapper.findAll('button')[0]!.text()).toBe('Отменить')
  })

  it('по нажатию запускает действие и закрывает тост', async () => {
    const run = vi.fn()
    const wrapper = mountToast({ action: { label: 'Отменить', run } })

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(run).toHaveBeenCalledOnce()
    expect(wrapper.emitted('close')).toEqual([['toast-1']])
  })

  it('закрытие крестиком не запускает действие', async () => {
    const run = vi.fn()
    const wrapper = mountToast({ action: { label: 'Отменить', run } })

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(run).not.toHaveBeenCalled()
    expect(wrapper.emitted('close')).toEqual([['toast-1']])
  })

  it('закрывается сам по истечении своей длительности и не запускает действие', () => {
    const run = vi.fn()
    const wrapper = mountToast({ duration: 5000, action: { label: 'Отменить', run } })

    vi.advanceTimersByTime(4999)
    expect(wrapper.emitted('close')).toBeUndefined()

    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toEqual([['toast-1']])
    expect(run).not.toHaveBeenCalled()
  })
})
