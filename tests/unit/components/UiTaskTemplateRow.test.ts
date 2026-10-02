import type { TemplateItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiTaskTemplateRow from '../../../app/components/ui/UiTaskTemplateRow.vue'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

const template: TemplateItem = {
  id: 'tpl-1',
  userId: 'user-1',
  title: 'Утренняя рутина',
  notes: null,
  priority: 'MEDIUM',
  createdAt: new Date('2026-09-14T09:00:00.000Z'),
  updatedAt: new Date('2026-09-14T09:00:00.000Z'),
  tags: []
}

function mountRow() {
  return mount(UiTaskTemplateRow, { props: { template } })
}

describe('uiTaskTemplateRow', () => {
  it('кнопка «Применить» не открывает редактирование', async () => {
    const wrapper = mountRow()

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('use')).toHaveLength(1)
    expect(wrapper.emitted('edit')).toBeUndefined()
  })

  it('тап по строке открывает редактирование', async () => {
    const wrapper = mountRow()

    await wrapper.trigger('click')

    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('use')).toBeUndefined()
  })

  it('красит полоску по приоритету', () => {
    const wrapper = mountRow()

    expect(wrapper.find('.bg-p-med').exists()).toBe(true)
  })
})
