import type { Category, Transaction } from '../../../prisma/.generated/prisma'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiTxRow from '../../../app/components/ui/UiTxRow.vue'

const dictionary: Record<string, string> = {
  'categories.food': 'Еда и напитки'
}

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => dictionary[key] ?? key }))

function category(overrides: Partial<Category> = {}): Category {
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

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    userId: 'user-1',
    type: 'EXPENSE',
    amount: 150,
    categoryId: 'cat-1',
    notes: null,
    date: new Date('2026-05-08'),
    createdAt: new Date('2026-05-08'),
    updatedAt: new Date('2026-05-08'),
    ...overrides
  } as unknown as Transaction
}

function mountRow(props: { category?: Category, transaction?: Transaction } = {}) {
  return mount(UiTxRow, {
    props: {
      transaction: props.transaction ?? transaction(),
      category: props.category ?? category(),
      showDate: false
    },
    global: { stubs: { UIcon: true } }
  })
}

describe('uiTxRow', () => {
  it('показывает перевод сидовой категории, а не её английское имя из БД', () => {
    const text = mountRow().text()

    expect(text).toContain('Еда и напитки')
    expect(text).not.toContain('Food & Drink')
  })

  it('показывает имя как есть, когда категорию переименовали и key обнулён', () => {
    const text = mountRow({ category: category({ name: 'Кофе', key: null }) }).text()

    expect(text).toContain('Кофе')
  })

  it('заметка вытесняет название категории в заголовке строки', () => {
    const text = mountRow({ transaction: transaction({ notes: 'Обед с Сашей' }) }).text()

    expect(text).toContain('Обед с Сашей')
    expect(text).toContain('Еда и напитки')
  })
})
