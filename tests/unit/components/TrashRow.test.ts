import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrashRow from '../../../app/components/features/settings/TrashRow.vue'

function mountRow(props: Record<string, unknown> = {}) {
  return mount(TrashRow, {
    props: { icon: 'i-lucide-square-check', title: 'Отчёт', caption: 'ещё 30 дней', ...props },
    global: { stubs: { UIcon: { props: ['name'], template: '<i :data-icon="name" />' } } }
  })
}

describe('trashRow', () => {
  it('показывает заголовок и подпись', () => {
    const text = mountRow().text()

    expect(text).toContain('Отчёт')
    expect(text).toContain('ещё 30 дней')
  })

  it('без суммы не рисует колонку суммы', () => {
    expect(mountRow().findAll('span.ml-auto')).toHaveLength(0)
  })

  it('рисует сумму в цвете строки', () => {
    const amount = mountRow({ amount: '+1 000 ₽', inkClass: 'text-success' }).find('span.ml-auto')

    expect(amount.text()).toBe('+1 000 ₽')
    expect(amount.classes()).toContain('text-success')
  })

  it('цвет категории красит плитку и иконку', () => {
    const wrapper = mountRow({ tileColor: '#FB923C' })

    expect(wrapper.find('span').attributes('style')).toContain('background-color')
    expect(wrapper.find('[data-icon]').attributes('style')).toContain('color')
  })

  it('без цвета категории плитка красится классом', () => {
    const tile = mountRow({ tileClass: 'bg-accent-soft' }).find('span')

    expect(tile.classes()).toContain('bg-accent-soft')
    expect(tile.attributes('style')).toBeUndefined()
  })
})
