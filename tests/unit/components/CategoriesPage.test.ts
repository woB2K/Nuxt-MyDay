import type { Category } from '../../../prisma/.generated/prisma'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import CategoriesPage from '../../../app/pages/settings/categories.vue'

const dictionary: Record<string, string> = {
  'categories.food': 'Еда и напитки',
  'categories.other-expense': 'Другое',
  'settings.categoriesScreen.expense': 'Расход',
  'settings.categoriesScreen.income': 'Доход'
}

const { list, remove } = vi.hoisted(() => ({ list: { value: [] as unknown[] }, remove: vi.fn() }))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => dictionary[key] ?? key }))
mockNuxtImport('useCategoriesQuery', () => () => ({ data: ref(list.value), isPending: ref(false) }))
mockNuxtImport('useDeleteCategoryMutation', () => () => ({ mutate: remove }))

function category(overrides: Partial<Category>): Category {
  return {
    id: 'cat-1',
    userId: 'user-1',
    name: 'Food & Drink',
    key: 'food',
    icon: 'i-lucide-utensils',
    color: '#FB923C',
    type: 'EXPENSE',
    isSystem: false,
    createdAt: new Date('2026-05-01'),
    updatedAt: new Date('2026-05-01'),
    ...overrides
  } as Category
}

function mountPage(categories: Category[]) {
  list.value = categories

  return mount(CategoriesPage, {
    global: {
      stubs: {
        UIcon: true,
        UiRoundBtn: true,
        UiCard: { template: '<div><slot /></div>' },
        UiSkeletonRow: true,
        CategoryEditSheet: true,
        UiSwipeRow: { props: ['deletable'], template: '<div :data-deletable="deletable"><slot /></div>' }
      }
    }
  })
}

describe('страница категорий', () => {
  it('не отдаёт удаление системной категории и отдаёт обычной', () => {
    const wrapper = mountPage([
      category({ id: 'a', name: 'Other', key: 'other-expense', isSystem: true }),
      category({ id: 'b' })
    ])

    const flags = wrapper.findAll('[data-deletable]').map(row => row.attributes('data-deletable'))

    expect(flags).toEqual(['false', 'true'])
  })

  it('показывает локализованное имя и тип категории', () => {
    const text = mountPage([category({})]).text()

    expect(text).toContain('Еда и напитки')
    expect(text).toContain('Расход')
  })

  it('сортирует расходы перед доходами, а внутри типа — по видимому имени', () => {
    const wrapper = mountPage([
      category({ id: 'i', name: 'Salary', key: null, type: 'INCOME' }),
      category({ id: 'b', name: 'Аренда', key: null }),
      category({ id: 'a', name: 'Авто', key: null })
    ])

    const names = wrapper.findAll('span.font-semibold').map(span => span.text())

    expect(names).toEqual(['Авто', 'Аренда', 'Salary'])
  })
})
