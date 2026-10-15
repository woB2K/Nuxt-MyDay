import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { LONG_PRESS_MS, useLongPress } from '../../../app/composables/useLongPress'

function usePress(onLong: () => void) {
  let result!: ReturnType<typeof useLongPress>
  const wrapper = mount({
    setup() {
      result = useLongPress(onLong)
      return () => h('div')
    }
  })

  return { ...result, wrapper }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useLongPress', () => {
  it('срабатывает после удержания и гасит следующий клик', () => {
    const onLong = vi.fn()
    const { start, guard, wrapper } = usePress(onLong)
    const click = new MouseEvent('click', { cancelable: true })

    start()
    vi.advanceTimersByTime(LONG_PRESS_MS)
    guard(click)

    expect(onLong).toHaveBeenCalledOnce()
    expect(click.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('короткий тап — обычный клик, без долгого нажатия', () => {
    const onLong = vi.fn()
    const { start, cancel, guard, wrapper } = usePress(onLong)
    const click = new MouseEvent('click', { cancelable: true })

    start()
    vi.advanceTimersByTime(LONG_PRESS_MS - 100)
    cancel()
    vi.advanceTimersByTime(200)
    guard(click)

    expect(onLong).not.toHaveBeenCalled()
    expect(click.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('размонтирование отменяет таймер', () => {
    const onLong = vi.fn()
    const { start, wrapper } = usePress(onLong)

    start()
    wrapper.unmount()
    vi.advanceTimersByTime(LONG_PRESS_MS)

    expect(onLong).not.toHaveBeenCalled()
  })
})
