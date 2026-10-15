import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HabitDetailPage from '../../../app/pages/habits/[id].vue'
import { toDateString } from '../../../app/utils/formatDate'

const { state, mocks } = vi.hoisted(() => ({
  state: { habits: undefined as unknown, pending: false, id: 'h-1' },
  mocks: {
    deleteHabit: vi.fn(),
    toggle: vi.fn(),
    navigateTo: vi.fn()
  }
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))
mockNuxtImport('useRoute', () => () => ({ params: { id: state.id } }))
mockNuxtImport('useHabitsQuery', () => () => ({ data: ref(state.habits), isPending: ref(state.pending) }))
mockNuxtImport('useDeleteHabitMutation', () => () => ({ mutate: mocks.deleteHabit }))
mockNuxtImport('useHabitMarking', () => () => ({ fx: ref({}), celebration: ref(0), celebrating: ref(false), toggle: mocks.toggle }))
mockNuxtImport('navigateTo', () => mocks.navigateTo)

function day(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)

  return toDateString(date)
}

function habit(marks: string[], perWeek: number | null = null): HabitItem {
  return { id: 'h-1', name: 'Медитация', icon: 'leaf', color: 'violet', perWeek, sortOrder: 0, marks, createdAt: '2026-01-01T12:00:00.000Z' } as unknown as HabitItem
}

function mountPage(habits: HabitItem[] | undefined, pending = false) {
  state.habits = habits
  state.pending = pending

  return mount(HabitDetailPage, {
    global: {
      stubs: {
        UIcon: true,
        UiSkeleton: true,
        UiButton: { template: '<button><slot /></button>' },
        HabitSheet: { props: ['open', 'habit'], template: '<div v-if="open" data-sheet :data-habit="habit.id" />' },
        HabitMonthCalendar: { emits: ['toggle'], template: '<button data-calendar @click="$emit(\'toggle\', \'2026-10-10\')" />' },
        HabitStatTile: { props: ['value', 'label'], template: '<div :data-tile="label">{{ value }}<slot /></div>' }
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

describe('экран привычки', () => {
  it('кнопка отметки за сегодня и под ней — серия под угрозой', async () => {
    const habits = [habit([day(-2), day(-1)])]
    const wrapper = mountPage(habits)

    expect(wrapper.find('[data-mark-today]').text()).toContain('habits.detail.markToday')
    expect(wrapper.find('[data-at-risk]').text()).toBe('habits.detail.atRisk({"n":2})')

    await wrapper.find('[data-mark-today]').trigger('click')

    expect(mocks.toggle).toHaveBeenCalledWith(habits, habits[0], undefined)
  })

  it('цифры: текущая, лучшая с бейджем рекорда, доля за 30 дней', () => {
    const wrapper = mountPage([habit([day(-2), day(-1), day(0)])])

    expect(wrapper.find('[data-tile="habits.detail.current"]').text()).toBe('3')
    expect(wrapper.find('[data-record]').exists()).toBe(true)
    expect(wrapper.find('[data-tile="habits.detail.rate"]').text()).toBe('10%')
  })

  it('недельная: строка плана недели и «недель с планом» вместо доли', () => {
    const wrapper = mountPage([habit([day(0)], 1)])

    expect(wrapper.find('[data-plan]').text()).toBe('habits.plan.weekly({"count":1})')
    expect(wrapper.find('[data-week-line]').text()).toBe('habits.detail.weekDone')
    expect(wrapper.find('[data-tile="habits.detail.weeks"]').exists()).toBe(true)
  })

  it('у новой недельной ещё нет закончившихся недель — прочерк вместо «0 из 0»', () => {
    const fresh = { ...habit([], 3), createdAt: new Date().toISOString() } as HabitItem

    expect(mountPage([fresh]).find('[data-tile="habits.detail.weeks"]').text()).toBe('—')
  })

  it('серия прервалась — мягкая карточка с лучшей серией', () => {
    const text = mountPage([habit([day(-10), day(-9), day(-8)])]).find('[data-broken]').text()

    expect(text).toContain('habits.detail.brokenTitle')
    expect(text).toContain('habits.days({\\"count\\":3})')
  })

  it('отметка дня из календаря', async () => {
    const habits = [habit([])]
    const wrapper = mountPage(habits)

    await wrapper.find('[data-calendar]').trigger('click')

    expect(mocks.toggle).toHaveBeenCalledWith(habits, habits[0], '2026-10-10')
  })

  it('«Изменить» открывает шторку этой привычки, «Удалить» — в корзину', async () => {
    const wrapper = mountPage([habit([])])

    await wrapper.find('[data-edit]').trigger('click')
    await wrapper.find('[data-delete]').trigger('click')

    expect(wrapper.find('[data-sheet]').attributes('data-habit')).toBe('h-1')
    expect(mocks.deleteHabit).toHaveBeenCalledWith({ id: 'h-1', name: 'Медитация' })
  })

  it('привычки нет (удалили или чужая ссылка) — назад к списку', () => {
    state.id = 'gone'
    mountPage([habit([])])
    state.id = 'h-1'

    expect(mocks.navigateTo).toHaveBeenCalledWith('/habits', { replace: true })
  })
})
