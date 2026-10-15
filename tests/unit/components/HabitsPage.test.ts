import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HabitsPage from '../../../app/pages/habits/index.vue'

const { state, mocks } = vi.hoisted(() => ({
  state: { habits: undefined as unknown, pending: false },
  mocks: {
    reorder: vi.fn(),
    deleteHabit: vi.fn(),
    toggle: vi.fn(),
    navigateTo: vi.fn()
  }
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))
mockNuxtImport('useHabitsQuery', () => () => ({ data: ref(state.habits), isPending: ref(state.pending) }))
mockNuxtImport('useReorderHabitsMutation', () => () => ({ mutate: mocks.reorder }))
mockNuxtImport('useDeleteHabitMutation', () => () => ({ mutate: mocks.deleteHabit }))
mockNuxtImport('useHabitMarking', () => () => ({ fx: ref({}), celebration: ref(0), celebrating: ref(false), toggle: mocks.toggle }))
mockNuxtImport('navigateTo', () => mocks.navigateTo)

function habit(id: string, perWeek: number | null = null): HabitItem {
  return { id, name: id, icon: 'leaf', color: 'green', perWeek, sortOrder: 0, marks: [], createdAt: '2026-06-01T12:00:00.000Z' } as unknown as HabitItem
}

function mountPage(habits: HabitItem[] | undefined, pending = false) {
  state.habits = habits
  state.pending = pending

  return mount(HabitsPage, {
    global: {
      stubs: {
        UIcon: true,
        UiSkeleton: true,
        UiFab: { template: '<button data-fab @click="$emit(\'click\')" />', emits: ['click'] },
        HabitSheet: { props: ['open'], template: '<div v-if="open" data-sheet />' },
        UiSwipeRow: {
          props: ['deletable'],
          emits: ['delete'],
          template: '<div :data-deletable="deletable"><button data-swipe-delete @click="$emit(\'delete\')" /><slot /></div>'
        },
        HabitRow: {
          props: ['habit', 'reorder'],
          emits: ['toggle', 'open'],
          template: '<div :data-row="habit.id"><span v-if="reorder" data-grip /><button data-toggle @click="$emit(\'toggle\')" /><button data-open @click="$emit(\'open\')" /></div>'
        }
      }
    }
  })
}

beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset())
})

describe('экран «Привычки»', () => {
  it('подзаголовок — сколько ежедневных отмечено сегодня', () => {
    expect(mountPage([habit('a'), habit('b'), habit('c', 3)]).find('[data-subtitle]').text()).toBe('habits.list.sub({"n":0,"m":2})')
  })

  it('отметка из строки и переход к привычке', async () => {
    const habits = [habit('a'), habit('b')]
    const wrapper = mountPage(habits)

    await wrapper.find('[data-row="b"] [data-toggle]').trigger('click')
    await wrapper.find('[data-row="a"] [data-open]').trigger('click')

    expect(mocks.toggle).toHaveBeenCalledWith(habits, habits[1])
    expect(mocks.navigateTo).toHaveBeenCalledWith('/habits/a')
  })

  it('свайп влево удаляет привычку с её названием для тоста', async () => {
    const wrapper = mountPage([habit('a')])

    await wrapper.find('[data-swipe-delete]').trigger('click')

    expect(mocks.deleteHabit).toHaveBeenCalledWith({ id: 'a', name: 'a' })
  })

  it('плюс в углу открывает шторку создания', async () => {
    const wrapper = mountPage([habit('a')])

    await wrapper.find('[data-fab]').trigger('click')

    expect(wrapper.find('[data-sheet]').exists()).toBe(true)
  })

  it('режим порядка: ручки, без FAB, свайпа и подсказки, подзаголовок — про перетаскивание', async () => {
    const wrapper = mountPage([habit('a'), habit('b')])

    await wrapper.find('[data-reorder]').trigger('click')

    expect(wrapper.findAll('[data-grip]')).toHaveLength(2)
    expect(wrapper.find('[data-fab]').exists()).toBe(false)
    expect(wrapper.find('[data-hint]').exists()).toBe(false)
    expect(wrapper.find('[data-deletable]').attributes('data-deletable')).toBe('false')
    expect(wrapper.find('[data-subtitle]').text()).toBe('habits.list.reorderHint')
  })

  it('перетаскивание за ручку сохраняет новый порядок', async () => {
    const wrapper = mountPage([habit('a'), habit('b'), habit('c')])
    await wrapper.find('[data-reorder]').trigger('click')

    const row = wrapper.findAll('[data-reorder-row]')[0]!
    await wrapper.find('[data-row="a"] [data-grip]').trigger('pointerdown', { clientY: 0, pointerId: 1 })
    await row.trigger('pointermove', { clientY: 16, pointerId: 1 })
    await row.trigger('pointerup', { pointerId: 1 })

    expect(mocks.reorder).toHaveBeenCalledWith(['b', 'c', 'a'])
  })

  it('без ручки строка не тащится', async () => {
    const wrapper = mountPage([habit('a'), habit('b')])
    await wrapper.find('[data-reorder]').trigger('click')

    const row = wrapper.findAll('[data-reorder-row]')[0]!
    await row.trigger('pointerdown', { clientY: 0 })
    await row.trigger('pointermove', { clientY: 40 })
    await row.trigger('pointerup')

    expect(mocks.reorder).not.toHaveBeenCalled()
  })

  it('кнопки «Порядок» нет, если привычка одна', () => {
    expect(mountPage([habit('a')]).find('[data-reorder]').exists()).toBe(false)
  })

  it('пусто — своё пустое состояние', () => {
    const wrapper = mountPage([])

    expect(wrapper.find('[data-empty]').text()).toContain('habits.list.emptyTitle')
  })
})
