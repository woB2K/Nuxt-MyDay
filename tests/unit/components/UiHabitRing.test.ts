import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiHabitRing from '../../../app/components/ui/UiHabitRing.vue'

function mountRing(props: Record<string, unknown> = {}) {
  return mount(UiHabitRing, {
    props: { icon: 'i-lucide-leaf', color: 'violet', label: 'Медитация', ...props },
    global: { stubs: { UIcon: true } }
  })
}

describe('uiHabitRing', () => {
  it('неотмеченный диск — мягкий цвет привычки, отмеченный — залит цветом', () => {
    expect(mountRing().find('[data-disc]').attributes('style')).toContain('var(--c-h-violet-soft)')
    expect(mountRing({ checked: true, filled: 1 }).find('[data-disc]').attributes('style')).toContain('background-color: var(--c-h-violet)')
  })

  it('кнопка с названием и состоянием для скринридера, тап — toggle', async () => {
    const wrapper = mountRing({ checked: true })
    const button = wrapper.find('button')

    expect(button.attributes('aria-label')).toBe('Медитация')
    expect(button.attributes('aria-pressed')).toBe('true')

    await button.trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('недельная — по сегменту на отметку плана', () => {
    const segments = mountRing({ segments: 3, filled: 2 }).findAll('[data-segment]').map(el => el.attributes('data-segment'))

    expect(segments).toEqual(['on', 'on', 'off'])
  })

  it('план недели выполнен — бейдж с галочкой, у ежедневной его нет', () => {
    expect(mountRing({ segments: 3, filled: 3 }).find('[data-plan-done]').exists()).toBe(true)
    expect(mountRing({ segments: 1, filled: 1, checked: true }).find('[data-plan-done]').exists()).toBe(false)
  })

  it('новый рекорд — разлёт точек', () => {
    expect(mountRing({ checked: true, filled: 1, fx: { type: 'record', key: 1 } }).findAll('[data-burst] span')).toHaveLength(8)
    expect(mountRing({ checked: true, filled: 1, fx: { type: 'on', key: 1 } }).find('[data-burst]').exists()).toBe(false)
  })
})
