import type { WeekDot } from '../../../app/utils/habits'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiWeekDots from '../../../app/components/ui/UiWeekDots.vue'

const days: WeekDot[] = [
  { date: '2026-10-09', marked: true, today: false, weekStart: false },
  { date: '2026-10-10', marked: false, today: false, weekStart: false },
  { date: '2026-10-11', marked: true, today: false, weekStart: false },
  { date: '2026-10-12', marked: false, today: false, weekStart: true },
  { date: '2026-10-13', marked: true, today: false, weekStart: false },
  { date: '2026-10-14', marked: false, today: false, weekStart: false },
  { date: '2026-10-15', marked: false, today: true, weekStart: false }
]

function dots(weekly = false) {
  return mount(UiWeekDots, { props: { days, color: 'green', weekly } }).findAll('[data-dot]')
}

describe('uiWeekDots', () => {
  it('семь квадратов, отмеченные — цветом привычки', () => {
    const items = dots()

    expect(items).toHaveLength(7)
    expect(items.filter(el => el.attributes('data-dot') === 'marked')).toHaveLength(3)
    expect(items[0]!.attributes('style')).toContain('var(--c-h-green)')
  })

  it('ежедневная: пропуск залит, сегодня без отметки — обводка цветом', () => {
    const items = dots()

    expect(items[1]!.attributes('style')).toContain('var(--c-elev3)')
    expect(items[6]!.attributes('style')).toContain('border-color: var(--c-h-green)')
  })

  it('недельная: пропуск нейтральный, перед понедельником зазор', () => {
    const items = dots(true)

    expect(items[1]!.attributes('style')).toContain('border-color: var(--c-hairline2)')
    expect(items[3]!.attributes('style')).toContain('margin-left: 3px')
    expect(dots()[3]!.attributes('style') ?? '').not.toContain('margin-left')
  })
})
