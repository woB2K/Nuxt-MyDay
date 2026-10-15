import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HabitsTodayBlock from '../../../app/components/features/habits/HabitsTodayBlock.vue'

const { state, mocks } = vi.hoisted(() => ({
  state: { habits: undefined as unknown, pending: false, user: null as { settings: Record<string, unknown> } | null },
  mocks: {
    toggle: vi.fn(),
    saveSettings: vi.fn(),
    info: vi.fn(),
    navigateTo: vi.fn()
  }
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))
mockNuxtImport('useHabitsQuery', () => () => ({ data: ref(state.habits), isPending: ref(state.pending) }))
mockNuxtImport('useHabitMarking', () => () => ({ fx: ref({}), celebration: ref(0), celebrating: ref(false), toggle: mocks.toggle }))
mockNuxtImport('useUpdateSettingsMutation', () => () => ({ mutate: mocks.saveSettings }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: () => {}, info: mocks.info }))
mockNuxtImport('useAuthStore', () => () => ({ user: state.user }))
mockNuxtImport('navigateTo', () => mocks.navigateTo)

const today = '2026-10-15'

function habit(id: string, marks: string[], perWeek: number | null = null): HabitItem {
  return { id, name: `Привычка ${id}`, icon: 'leaf', color: 'green', perWeek, sortOrder: 0, marks, createdAt: '2026-06-01T12:00:00.000Z' } as unknown as HabitItem
}

function mountBlock(habits: HabitItem[] | undefined, pending = false) {
  state.habits = habits
  state.pending = pending
  state.user = { settings: { habitsOnToday: true } }

  return mount(HabitsTodayBlock, {
    props: { today },
    global: {
      stubs: {
        UIcon: true,
        UiSkeleton: { template: '<div data-skeleton-item />' },
        HabitSheet: { props: ['open'], template: '<div v-if="open" data-sheet />' },
        HabitRingItem: {
          props: ['habit'],
          emits: ['toggle', 'open'],
          template: '<div :data-ring="habit.id"><button data-tap @click="$emit(\'toggle\')" /><button data-hold @click="$emit(\'open\')" /></div>'
        }
      }
    }
  })
}

beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('блок привычек на «Сегодня»', () => {
  it('тап по кольцу отмечает привычку', async () => {
    const habits = [habit('a', []), habit('b', [])]
    const wrapper = mountBlock(habits)

    await wrapper.find('[data-ring="b"] [data-tap]').trigger('click')

    expect(mocks.toggle).toHaveBeenCalledWith(habits, habits[1])
  })

  it('удержание открывает привычку, заголовок — список', async () => {
    const wrapper = mountBlock([habit('a', [])])

    await wrapper.find('[data-ring="a"] [data-hold]').trigger('click')
    await wrapper.find('[data-open-list]').trigger('click')

    expect(mocks.navigateTo.mock.calls).toEqual([['/habits/a'], ['/habits']])
  })

  it('счётчик — только ежедневные привычки', () => {
    const text = mountBlock([habit('a', [today]), habit('b', []), habit('c', [], 3)]).find('[data-progress]').text()

    expect(text).toBe('1 / 2')
  })

  it('без ежедневных — «Неделя» и сколько планов выполнено', () => {
    const text = mountBlock([habit('a', ['2026-10-12'], 1), habit('b', [], 2)]).find('[data-progress]').text()

    expect(text).toBe('habits.today.week · 1 / 2')
  })

  it('все ежедневные отмечены — «Всё на сегодня»', () => {
    const wrapper = mountBlock([habit('a', [today]), habit('b', [], 3)])

    expect(wrapper.find('[data-all-done]').text()).toContain('habits.today.allDone')
  })

  it('без привычек — пустой вход, тап открывает шторку создания', async () => {
    const wrapper = mountBlock([])

    await wrapper.find('[data-add]').trigger('click')

    expect(wrapper.find('[data-sheet]').exists()).toBe(true)
  })

  it('крестик прячет блок: настройка, тост и «Отменить»', async () => {
    const wrapper = mountBlock([])

    await wrapper.find('[data-hide]').trigger('click')

    expect(state.user!.settings.habitsOnToday).toBe(false)
    expect(mocks.saveSettings).toHaveBeenCalledWith({ habitsOnToday: false })
    expect(mocks.info).toHaveBeenCalledWith('habits.today.hiddenToast', {
      action: { label: 'general.undo', run: expect.any(Function) }
    })

    mocks.info.mock.calls[0]![1].action.run()

    expect(mocks.saveSettings).toHaveBeenLastCalledWith({ habitsOnToday: true })
    expect(state.user!.settings.habitsOnToday).toBe(true)
  })

  it('пока грузится — скелетон, если не загрузилось — пустого входа нет', () => {
    expect(mountBlock(undefined, true).find('[data-skeleton]').exists()).toBe(true)
    expect(mountBlock(undefined).find('[data-empty]').exists()).toBe(false)
  })
})
