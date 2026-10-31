import type { CategoryInfo } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import UiCategoryBar from '../../../app/components/ui/UiCategoryBar.vue'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

const category: CategoryInfo = { id: 'cat-1', name: 'Taxi', key: null, icon: 'i-lucide-car', color: '#FB923C' }

function mountBar(clickable?: boolean) {
  return mount(UiCategoryBar, {
    props: { category, amount: 500, maxAmount: 1000, totalAmount: 2000, clickable }
  })
}

describe('uiCategoryBar', () => {
  it('по умолчанию — не кнопка и без шеврона', async () => {
    const wrapper = mountBar()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.html()).not.toContain('chevron-right')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('clickable — кнопка с шевроном, тап отдаёт click', async () => {
    const wrapper = mountBar(true)

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.html()).toContain('chevron-right')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
