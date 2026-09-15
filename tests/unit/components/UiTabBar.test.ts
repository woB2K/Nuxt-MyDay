import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiTabBar from '../../../app/components/ui/UiTabBar.vue'

const { path } = vi.hoisted(() => ({ path: { value: '/today' } }))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useRoute', () => () => ({ path: path.value }))

function mountBar(current: string) {
  path.value = current

  return mount(UiTabBar, {
    global: { stubs: { UIcon: true, NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } }
  })
}

describe('uiTabBar', () => {
  it('рисует индикатор ровно под активной вкладкой', () => {
    const links = mountBar('/finance').findAll('a')
    const marked = links.filter(link => link.find('.bg-accent-soft').exists())

    expect(links).toHaveLength(4)
    expect(marked).toHaveLength(1)
    expect(marked[0]!.attributes('href')).toBe('/finance')
  })

  it('переносит индикатор на вложенный маршрут', () => {
    const marked = mountBar('/settings/categories').findAll('a')
      .filter(link => link.find('.bg-accent-soft').exists())

    expect(marked[0]!.attributes('href')).toBe('/settings')
  })

  it('красит активную вкладку акцентом, остальные — приглушённым текстом', () => {
    const links = mountBar('/tasks').findAll('a')

    expect(links[1]!.classes()).toContain('text-accent')
    expect(links[0]!.classes()).toContain('text-text-mute')
  })
})
