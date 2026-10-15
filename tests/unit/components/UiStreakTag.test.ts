import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiStreakTag from '../../../app/components/ui/UiStreakTag.vue'

function mountTag(props: Record<string, unknown>) {
  return mount(UiStreakTag, {
    props: { value: 0, active: false, color: 'amber', ...props },
    global: { stubs: { UIcon: { props: ['name'], template: '<i :data-icon="name" />' } } }
  })
}

describe('uiStreakTag', () => {
  it('без серии — прочерк, а если прочерк не нужен — ничего', () => {
    expect(mountTag({}).text()).toBe('—')
    expect(mountTag({ dash: false }).find('[data-streak]').exists()).toBe(false)
  })

  it('число или длинная подпись', () => {
    expect(mountTag({ value: 12 }).text()).toBe('12')
    expect(mountTag({ value: 12, label: '12 дней' }).text()).toBe('12 дней')
  })

  it('огонь в цвете привычки, пока серия жива сегодня, иначе приглушён', () => {
    expect(mountTag({ value: 3, active: true }).find('[data-streak]').attributes('style')).toContain('var(--c-h-amber)')
    expect(mountTag({ value: 3 }).find('[data-streak]').attributes('style')).toContain('var(--c-text-mute)')
  })

  it('на рекорде огонь сменяется кубком', () => {
    expect(mountTag({ value: 7, active: true, fx: { type: 'record', key: 1 } }).find('[data-icon]').attributes('data-icon')).toBe('i-lucide-trophy')
    expect(mountTag({ value: 7, active: true }).find('[data-icon]').attributes('data-icon')).toBe('i-lucide-flame')
  })
})
