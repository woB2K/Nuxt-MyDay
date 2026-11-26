import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiSettingRow from '../../../app/components/ui/UiSettingRow.vue'

const mountRow = (props: Record<string, unknown>) =>
  mount(UiSettingRow, { props: { icon: 'i-lucide-bell', label: 'Push', sub: 'Длинная подсказка', ...props }, global: { stubs: { UIcon: true } } })

describe('uiSettingRow', () => {
  it('обрезает подпись в одну строку по умолчанию', () => {
    expect(mountRow({}).find('.text-text-mute').classes()).toContain('truncate')
  })

  it('с wrapSub переносит подпись, чтобы длинная подсказка читалась целиком', () => {
    const sub = mountRow({ wrapSub: true }).find('.text-text-mute')

    expect(sub.classes()).not.toContain('truncate')
    expect(sub.text()).toBe('Длинная подсказка')
  })
})
