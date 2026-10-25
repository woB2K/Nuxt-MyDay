import type { OutboxEntry } from '../../../app/utils/outbox'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import PendingTransactions from '../../../app/components/features/finance/PendingTransactions.vue'

const { state } = vi.hoisted(() => ({
  state: { pending: [] as OutboxEntry[], categories: [] as unknown[] }
}))

const dictionary: Record<string, string> = {
  'outbox.title': 'Ждут отправки',
  'outbox.hint': 'Отправим, когда появится сеть',
  'finance.category': 'Категория',
  'categories.food': 'Еда'
}

mockNuxtImport('useI18n', () => () => ({ locale: { value: 'ru' }, t: (key: string) => dictionary[key] ?? key }))
mockNuxtImport('useOutbox', () => () => ({ pending: computed(() => state.pending) }))
mockNuxtImport('useCategoriesQuery', () => () => ({ data: ref(state.categories) }))
mockNuxtImport('useFamily', () => () => ({ authorFor: () => undefined }))
mockNuxtImport('useFinanceTagNames', () => () => (ids: string[]) => ids.map(id => `tag-${id}`))

function queued(id: string, notes?: string): OutboxEntry {
  return {
    id,
    userId: 'user-1',
    url: '/api/finance/transactions',
    body: { id, type: 'EXPENSE', amount: 350, categoryId: 'cat-food', date: '2026-10-14', notes, tagIds: ['t1'] },
    createdAt: 1
  }
}

function mountSection() {
  return mount(PendingTransactions, {
    global: {
      stubs: {
        UIcon: true,
        UiCard: { template: '<div><slot /></div>' },
        UiSectionHeader: { props: ['title', 'caption'], template: '<h2>{{ title }} {{ caption }}</h2>' }
      }
    }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  state.pending = []
  state.categories = [{ id: 'cat-food', key: 'food', name: 'Food', icon: 'i-lucide-utensils', color: '#FB923C' }]
})

describe('секция «Ждут отправки»', () => {
  it('пустая очередь — секции нет', () => {
    expect(mountSection().find('[data-testid="outbox-pending"]').exists()).toBe(false)
  })

  it('показывает неотправленные записи со счётчиком и пометкой ожидания', () => {
    state.pending = [queued('a', 'Кофе'), queued('b')]

    const wrapper = mountSection()

    expect(wrapper.find('h2').text()).toBe('Ждут отправки 2')
    expect(wrapper.text()).toContain('Отправим, когда появится сеть')
    expect(wrapper.findAll('[data-testid="tx-pending"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Кофе')
    expect(wrapper.text()).toContain('Еда')
    expect(wrapper.text()).toContain('#tag-t1')
  })

  it('если категорий нет в кэше, строка всё равно рисуется', () => {
    state.categories = []
    state.pending = [queued('a')]

    const wrapper = mountSection()

    expect(wrapper.findAll('[data-testid="tx-pending"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Категория')
  })
})
