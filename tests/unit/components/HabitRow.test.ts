import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HabitRow from '../../../app/components/features/habits/HabitRow.vue'

mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))

const today = '2026-10-15'

function habit(marks: string[], perWeek: number | null = null): HabitItem {
  return { id: 'h-1', name: 'Медитация', icon: 'leaf', color: 'violet', perWeek, sortOrder: 0, marks, createdAt: '2026-06-01T12:00:00.000Z' } as unknown as HabitItem
}

function mountRow(source: HabitItem, reorder = false) {
  return mount(HabitRow, {
    props: { habit: source, today, reorder },
    global: { stubs: { UIcon: true } }
  })
}

describe('строка привычки', () => {
  it('ежедневная: серия в днях, без подписи плана', () => {
    const wrapper = mountRow(habit(['2026-10-14', today]))

    expect(wrapper.find('[data-plan]').exists()).toBe(false)
    expect(wrapper.find('[data-streak]').text()).toBe('habits.days({"count":2})')
  })

  it('недельная: «3× в неделю» рядом с названием, серия в разах', () => {
    const wrapper = mountRow(habit(['2026-10-12', '2026-10-13'], 3))

    expect(wrapper.find('[data-plan]').text()).toBe('habits.plan.short({"count":3})')
    expect(wrapper.find('[data-streak]').text()).toBe('habits.times({"count":2})')
  })

  it('серия прервалась — «Начнём заново» и лучшая серия', () => {
    const text = mountRow(habit(['2026-10-01', '2026-10-02', '2026-10-03'])).find('[data-restart]').text()

    expect(text).toContain('habits.list.restart')
    expect(text).toContain('habits.list.best({"n":3})')
  })

  it('тап по чекбоксу отмечает, по строке — открывает привычку', async () => {
    const wrapper = mountRow(habit([]))

    await wrapper.find('[data-check]').trigger('click')
    await wrapper.find('[data-habit-row]').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('в режиме порядка — ручка вместо чекбокса, тап ничего не открывает', async () => {
    const wrapper = mountRow(habit([]), true)

    await wrapper.find('[data-habit-row]').trigger('click')

    expect(wrapper.find('[data-grip]').exists()).toBe(true)
    expect(wrapper.find('[data-check]').exists()).toBe(false)
    expect(wrapper.emitted('open')).toBeUndefined()
  })
})
