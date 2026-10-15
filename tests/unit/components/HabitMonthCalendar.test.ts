import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HabitMonthCalendar from '../../../app/components/features/habits/HabitMonthCalendar.vue'

const { lang } = vi.hoisted(() => ({ lang: { value: 'ru' } }))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key, locale: ref(lang.value) }))

const today = '2026-10-15'

function habit(marks: string[], perWeek: number | null = null, created = '2026-09-01'): HabitItem {
  return { id: 'h-1', name: 'Бег', icon: 'footprints', color: 'teal', perWeek, sortOrder: 0, marks, createdAt: `${created}T12:00:00.000Z` } as unknown as HabitItem
}

function mountCalendar(source: HabitItem) {
  return mount(HabitMonthCalendar, {
    props: { habit: source, today },
    global: {
      stubs: {
        UIcon: true,
        UiRoundBtn: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' }
      }
    }
  })
}

describe('календарь привычки', () => {
  it('неделя с понедельника, заголовок — месяц с заглавной без «г.»', () => {
    const wrapper = mountCalendar(habit([]))

    expect(wrapper.find('[data-month]').text()).toBe('Октябрь 2026')
    expect(wrapper.findAll('[data-day]')[0]!.attributes('data-day')).toBe('2026-10-01')
  })

  it('в английском тоже неделя с понедельника, одинаковые буквы дней не теряются', () => {
    lang.value = 'en'
    const labels = mountCalendar(habit([])).findAll('[data-weekday]').map(el => el.text())
    lang.value = 'ru'

    expect(labels).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })

  it('в окне семи дней клетки — кнопки, тап отдаёт дату', async () => {
    const wrapper = mountCalendar(habit(['2026-10-14']))

    const open = wrapper.find('button[data-day="2026-10-10"]')
    await open.trigger('click')

    expect(open.attributes('data-state')).toBe('open')
    expect(wrapper.find('button[data-day="2026-10-14"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('toggle')).toEqual([['2026-10-10']])
  })

  it('старше окна и будущее — только просмотр', () => {
    const wrapper = mountCalendar(habit(['2026-10-01']))

    expect(wrapper.find('button[data-day="2026-10-01"]').exists()).toBe(false)
    expect(wrapper.find('[data-day="2026-10-01"]').attributes('data-state')).toBe('done')
    expect(wrapper.find('[data-day="2026-10-02"]').attributes('data-state')).toBe('missed')
    expect(wrapper.find('[data-day="2026-10-20"]').attributes('data-state')).toBe('inactive')
  })

  it('листает назад до месяца создания, вперёд — не дальше текущего', async () => {
    const wrapper = mountCalendar(habit([], null, '2026-09-10'))

    expect(wrapper.find('[data-next]').attributes('disabled')).toBeDefined()

    await wrapper.find('[data-prev]').trigger('click')

    expect(wrapper.find('[data-month]').text()).toBe('Сентябрь 2026')
    expect(wrapper.find('[data-prev]').attributes('disabled')).toBeDefined()
  })

  it('у недельной — колонка итога недели', () => {
    const summaries = mountCalendar(habit(['2026-10-06', '2026-10-07', '2026-10-13'], 2))
      .findAll('[data-week-summary]')
      .map(el => [el.attributes('data-week-summary'), el.text()])

    expect(summaries[2]).toEqual(['1', '1/2'])
    expect(summaries[3]).toEqual(['', ''])
  })
})
