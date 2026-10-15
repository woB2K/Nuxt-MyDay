import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { useHabitMarking } from '../../../app/composables/useHabitMarking'

const { mutate, toastSuccess } = vi.hoisted(() => ({
  mutate: vi.fn(),
  toastSuccess: vi.fn()
}))

mockNuxtImport('useToggleHabitMarkMutation', () => () => ({ mutate }))
mockNuxtImport('useAppToast', () => () => ({ success: toastSuccess, error: () => {}, info: () => {} }))
mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))

function habit(id: string, marks: string[], perWeek: number | null = null): HabitItem {
  return { id, name: id, marks, perWeek, createdAt: '2026-06-01T12:00:00.000Z' } as unknown as HabitItem
}

function useMarking(today: string) {
  let result!: ReturnType<typeof useHabitMarking>
  const wrapper = mount({
    setup() {
      result = useHabitMarking(ref(today))
      return () => h('div')
    }
  })

  return { ...result, wrapper }
}

beforeEach(() => {
  mutate.mockReset()
  toastSuccess.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useHabitMarking', () => {
  it('отмечает сегодня и проигрывает «on», повторный тап — снимает и «off»', () => {
    const today = '2026-10-15'
    const { toggle, fx, wrapper } = useMarking(today)

    toggle([habit('a', [])], habit('a', []))
    expect(mutate).toHaveBeenLastCalledWith({ id: 'a', date: today, marked: true })
    expect(fx.value.a?.type).toBe('on')

    toggle([habit('a', [today])], habit('a', [today]))
    expect(mutate).toHaveBeenLastCalledWith({ id: 'a', date: today, marked: false })
    expect(fx.value.a?.type).toBe('off')
    wrapper.unmount()
  })

  it('отмечает и прошлый день из окна', () => {
    const { toggle, wrapper } = useMarking('2026-10-15')

    toggle([habit('a', [])], habit('a', []), '2026-10-12')

    expect(mutate).toHaveBeenCalledWith({ id: 'a', date: '2026-10-12', marked: true })
    wrapper.unmount()
  })

  it('новый рекорд — трофей и тост с серией', () => {
    const before = habit('a', ['2026-10-12', '2026-10-13', '2026-10-14'])
    const { toggle, fx, wrapper } = useMarking('2026-10-15')

    toggle([before], before)

    expect(fx.value.a?.type).toBe('record')
    expect(toastSuccess).toHaveBeenCalledWith('toast.habits.record({"n":"habits.days({\\"count\\":4})"})')
    wrapper.unmount()
  })

  it('последняя ежедневная — через паузу «всё на сегодня» и волна у остальных, один раз за день', () => {
    const today = '2026-10-16'
    const done = habit('a', [today])
    const last = habit('b', [])
    const weekly = habit('c', [], 3)
    const { toggle, fx, celebration, celebrating, wrapper } = useMarking(today)

    toggle([done, last, weekly], last)

    expect(celebrating.value).toBe(true)
    vi.advanceTimersByTime(380)
    expect(celebration.value).toBe(1)
    expect(fx.value.a?.type).toBe('wave')
    expect(fx.value.c).toMatchObject({ type: 'wave', delay: 80 })
    expect(fx.value.b?.type).toBe('on')

    toggle([done, habit('b', []), weekly], habit('b', []))
    vi.advanceTimersByTime(380)
    expect(celebration.value).toBe(1)
    wrapper.unmount()
  })

  it('без отметки за сегодня праздника нет', () => {
    const today = '2026-10-17'
    const { toggle, celebrating, wrapper } = useMarking(today)

    toggle([habit('a', [])], habit('a', []), '2026-10-16')

    expect(celebrating.value).toBe(false)
    wrapper.unmount()
  })
})
