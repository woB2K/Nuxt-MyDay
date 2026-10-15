import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import UiHabitCheck from '../../../app/components/ui/UiHabitCheck.vue'

function mountCheck(props: Record<string, unknown> = {}) {
  return mount(UiHabitCheck, {
    props: { color: 'blue', ...props },
    global: { stubs: { UIcon: true } }
  })
}

describe('uiHabitCheck', () => {
  it('отмеченный — залит цветом привычки, пустой — с обводкой', () => {
    expect(mountCheck({ checked: true }).find('[data-check]').attributes('style')).toContain('background-color: var(--c-h-blue)')
    expect(mountCheck().find('[data-check]').classes()).toContain('border-hairline2')
  })

  it('недельная — сегменты вокруг чекбокса', () => {
    expect(mountCheck({ segments: 3, filled: 1 }).findAll('[data-segment]')).toHaveLength(3)
    expect(mountCheck().findAll('[data-segment]')).toHaveLength(0)
  })

  it('тап не всплывает до строки', async () => {
    let rowClicks = 0
    const wrapper = mount({
      render: () => h('div', { onClick: () => { rowClicks += 1 } }, [h(UiHabitCheck, { color: 'blue' })])
    }, { global: { stubs: { UIcon: true } } })

    await wrapper.find('button').trigger('click')

    expect(rowClicks).toBe(0)
    expect(wrapper.findComponent(UiHabitCheck).emitted('toggle')).toHaveLength(1)
  })
})
