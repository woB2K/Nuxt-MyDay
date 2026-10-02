import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UiPinPad from '../../../app/components/ui/UiPinPad.vue'

function mountPad(props: Record<string, unknown> = {}) {
  return mount(UiPinPad, {
    props,
    global: {
      stubs: { UIcon: true },
      mocks: { $t: (key: string) => key }
    }
  })
}

type Pad = ReturnType<typeof mountPad>

function digit(wrapper: Pad, value: string) {
  return wrapper.findAll('button').find(button => button.text() === value)!
}

function filled(wrapper: Pad) {
  return wrapper.findAll('span.rounded-full').filter(dot => dot.classes().includes('bg-accent')).length
}

async function type(wrapper: Pad, pin: string) {
  for (const value of pin) await digit(wrapper, value).trigger('click')
}

describe('uiPinPad', () => {
  it('заполняет точки по мере ввода', async () => {
    const wrapper = mountPad()

    await type(wrapper, '12')

    expect(filled(wrapper)).toBe(2)
  })

  it('эмитит submit ровно на четвёртой цифре', async () => {
    const wrapper = mountPad()

    await type(wrapper, '123')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await type(wrapper, '4')
    expect(wrapper.emitted('submit')).toEqual([['1234']])
  })

  it('не набирает больше длины и не шлёт submit дважды', async () => {
    const wrapper = mountPad()

    await type(wrapper, '123456')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(filled(wrapper)).toBe(4)
  })

  it('backspace стирает последнюю цифру', async () => {
    const wrapper = mountPad()

    await type(wrapper, '12')
    await wrapper.findAll('button').at(-1)!.trigger('click')

    expect(filled(wrapper)).toBe(1)
  })

  it('принимает ввод с физической клавиатуры', async () => {
    const wrapper = mountPad()

    for (const key of '1234') document.dispatchEvent(new KeyboardEvent('keydown', { key }))
    await nextTick()

    expect(wrapper.emitted('submit')).toEqual([['1234']])
  })

  it('reject трясёт точки и очищает ввод', async () => {
    vi.useFakeTimers()
    const wrapper = mountPad({ error: 'Неверный PIN' })

    await type(wrapper, '12');
    (wrapper.vm as unknown as { reject: () => void }).reject()
    await nextTick()

    expect(filled(wrapper)).toBe(0)
    expect(wrapper.find('.animate-pin-shake').exists()).toBe(true)

    vi.advanceTimersByTime(500)
    await nextTick()
    expect(wrapper.find('.animate-pin-shake').exists()).toBe(false)

    vi.useRealTimers()
  })

  it('не принимает ввод, пока идёт проверка', async () => {
    const wrapper = mountPad({ disabled: true })

    await type(wrapper, '1234')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('показывает текст ошибки под точками', () => {
    expect(mountPad({ error: 'Неверный PIN' }).text()).toContain('Неверный PIN')
  })
})
