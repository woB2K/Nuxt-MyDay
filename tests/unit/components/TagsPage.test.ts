import type { Tag } from '../../../prisma/.generated/prisma'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TagsPage from '../../../app/pages/settings/tags.vue'

const { state, remove } = vi.hoisted(() => ({
  state: { list: [] as unknown[], pending: false },
  remove: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useTagsQuery', () => () => ({ data: ref(state.list), isPending: ref(state.pending) }))
mockNuxtImport('useDeleteTagMutation', () => () => ({ mutate: remove }))

function tag(id: string, name: string): Tag {
  return {
    id,
    userId: 'user-1',
    name,
    color: null,
    createdAt: new Date('2026-09-14'),
    updatedAt: new Date('2026-09-14')
  }
}

function mountPage(tags: Tag[], pending = false) {
  state.list = tags
  state.pending = pending
  remove.mockReset()

  return mount(TagsPage, {
    global: {
      stubs: {
        UIcon: true,
        UiRoundBtn: true,
        UiCard: { template: '<div><slot /></div>' },
        UiSkeletonRow: { template: '<div data-skeleton />' },
        UiEmptyState: { props: ['title'], template: '<div data-empty>{{ title }}</div>' },
        UiSwipeRow: { emits: ['delete'], template: '<div data-row><button data-delete @click="$emit(\'delete\')" /><slot /></div>' }
      }
    }
  })
}

describe('страница тегов', () => {
  it('показывает теги по алфавиту', () => {
    const wrapper = mountPage([tag('b', 'Работа'), tag('c', 'Дом'), tag('a', 'Здоровье')])

    const names = wrapper.findAll('[data-row] span.font-semibold').map(el => el.text())

    expect(names).toEqual(['Дом', 'Здоровье', 'Работа'])
  })

  it('свайп-удаление удаляет именно этот тег', async () => {
    const wrapper = mountPage([tag('b', 'Работа'), tag('c', 'Дом')])

    await wrapper.findAll('[data-delete]')[1]!.trigger('click')

    expect(remove).toHaveBeenCalledWith('b')
  })

  it('без тегов показывает пустое состояние и не показывает подсказку про свайп', () => {
    const wrapper = mountPage([])

    expect(wrapper.find('[data-empty]').text()).toBe('settings.tagsScreen.emptyTitle')
    expect(wrapper.text()).not.toContain('settings.tagsScreen.hint')
    expect(wrapper.find('[data-row]').exists()).toBe(false)
  })

  it('пока теги грузятся, показывает скелетоны, а не пустое состояние', () => {
    const wrapper = mountPage([], true)

    expect(wrapper.findAll('[data-skeleton]').length).toBeGreaterThan(0)
    expect(wrapper.find('[data-empty]').exists()).toBe(false)
  })
})
