import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HabitSheet from '../../../app/components/features/habits/HabitSheet.vue'

const { addMutate, updateMutate, deleteMutate } = vi.hoisted(() => ({
  addMutate: vi.fn(),
  updateMutate: vi.fn(),
  deleteMutate: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))
mockNuxtImport('useAddHabitMutation', () => () => ({ mutate: addMutate, isPending: ref(false) }))
mockNuxtImport('useUpdateHabitMutation', () => () => ({ mutate: updateMutate, isPending: ref(false) }))
mockNuxtImport('useDeleteHabitMutation', () => () => ({ mutate: deleteMutate }))

const existing = {
  id: 'h-1',
  name: 'Спортзал',
  icon: 'biceps-flexed',
  color: 'red',
  perWeek: 3,
  sortOrder: 0,
  marks: [],
  createdAt: '2026-06-01T12:00:00.000Z'
} as unknown as HabitItem

function mountSheet(habit: HabitItem | null = null) {
  return mount(HabitSheet, {
    props: { open: true, habit },
    global: {
      stubs: {
        UiSheet: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /></div>' },
        UiInput: true,
        UiRoundBtn: { props: ['disabled'], template: '<button type="button" :disabled="disabled"><slot /></button>' },
        UiButton: { props: ['disabled'], template: '<button type="submit" :disabled="disabled" data-save><slot /></button>' },
        UIcon: true
      }
    }
  })
}

beforeEach(() => {
  addMutate.mockReset()
  updateMutate.mockReset()
  deleteMutate.mockReset()
})

describe('шторка привычки', () => {
  it('создаёт ежедневную привычку с выбранными иконкой и цветом', async () => {
    const wrapper = mountSheet()
    await wrapper.findComponent({ name: 'UiInput' }).setValue('  Чтение ')
    await wrapper.find('[data-icon="book-open"]').trigger('click')
    await wrapper.find('[data-color="amber"]').trigger('click')

    await wrapper.find('form').trigger('submit')

    expect(addMutate.mock.calls[0]![0]).toEqual({ name: 'Чтение', icon: 'book-open', color: 'amber', perWeek: null })
  })

  it('быстрого старта нет', () => {
    expect(mountSheet().text()).not.toContain('quick')
  })

  it('«N раз в неделю» — степпер от 1 до 6, план уходит с привычкой', async () => {
    const wrapper = mountSheet()
    await wrapper.findComponent({ name: 'UiInput' }).setValue('Бег')
    await wrapper.find('[data-schedule="weekly"]').trigger('click')

    expect(wrapper.find('[data-count]').text()).toBe('3')
    await wrapper.find('[data-plus]').trigger('click')
    await wrapper.find('[data-plus]').trigger('click')
    await wrapper.find('[data-plus]').trigger('click')
    await wrapper.find('[data-plus]').trigger('click')

    expect(wrapper.find('[data-count]').text()).toBe('6')
    expect(wrapper.find('[data-plus]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-schedule="weekly"]').text()).toBe('habits.plan.weekly({"count":6})')

    await wrapper.find('form').trigger('submit')

    expect(addMutate.mock.calls[0]![0]).toMatchObject({ name: 'Бег', perWeek: 6 })
  })

  it('без названия кнопка неактивна и ничего не уходит', async () => {
    const wrapper = mountSheet()

    expect(wrapper.find('[data-save]').attributes('disabled')).toBeDefined()

    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
  })

  it('правка заполняет форму и сохраняет ту же привычку', async () => {
    const wrapper = mountSheet(existing)

    expect(wrapper.find('h2').text()).toBe('habits.sheet.editTitle')
    expect(wrapper.find('[data-schedule="weekly"]').attributes('aria-checked')).toBe('true')
    await wrapper.find('[data-schedule="daily"]').trigger('click')
    await wrapper.find('form').trigger('submit')

    expect(updateMutate.mock.calls[0]![0]).toEqual({ id: 'h-1', name: 'Спортзал', icon: 'biceps-flexed', color: 'red', perWeek: null })
  })

  it('удаление закрывает шторку и отправляет привычку в корзину', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.find('[data-delete]').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(deleteMutate).toHaveBeenCalledWith({ id: 'h-1', name: 'Спортзал' })
  })

  it('у новой привычки удаления нет', () => {
    expect(mountSheet().find('[data-delete]').exists()).toBe(false)
  })
})
