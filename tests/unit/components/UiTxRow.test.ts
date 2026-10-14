import type { TxAuthor } from '../../../app/utils/family'
import type { Category, Transaction } from '../../../prisma/.generated/prisma'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import UiTxRow from '../../../app/components/ui/UiTxRow.vue'
import { useUiStore } from '../../../app/stores/ui'

const dictionary: Record<string, string> = {
  'categories.food': 'Еда и напитки'
}

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => dictionary[key] ?? key }))

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

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

function mountRow(props: { category?: Category, transaction?: Transaction, author?: TxAuthor, tags?: string[] } = {}) {
  return mount(UiTxRow, {
    props: {
      transaction: props.transaction ?? transaction(),
      category: props.category ?? category(),
      showDate: false,
      author: props.author,
      tags: props.tags
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

  it('свои операции — без бейджа автора', () => {
    expect(mountRow().find('[data-testid="tx-author"]').exists()).toBe(false)
  })

  it('у чужой операции бейдж с инициалом, имя в строке — только при совпадении инициалов', () => {
    const plain = mountRow({ author: { name: 'Маша', colorIndex: 1, named: false } })
    expect(plain.find('[data-testid="tx-author"]').text()).toBe('М')
    expect(plain.text()).not.toContain('Маша')

    const named = mountRow({ author: { name: 'Маша', colorIndex: 1, named: true } })
    expect(named.text()).toContain('Еда и напитки · Маша')
  })

  it('показывает два тега, остальные — счётчиком', () => {
    const wrapper = mountRow({ tags: ['отпуск', 'кафе', 'дети'] })

    expect(wrapper.findAll('[data-testid="tx-tag"]').map(el => el.text())).toEqual(['#отпуск', '#кафе'])
    expect(wrapper.text()).toContain('+1')
  })

  it('без тегов не рисует ни чипов, ни счётчика', () => {
    const wrapper = mountRow()

    expect(wrapper.find('[data-testid="tx-tag"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('+')
  })

  it('в privacy mode вместо суммы и знака — плашка-скелетон', () => {
    useUiStore().toggleAmountsHidden()

    const wrapper = mountRow({ transaction: transaction({ type: 'INCOME', amount: 12_500 }) })

    expect(wrapper.find('[data-testid="money-hidden"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('12')
    expect(wrapper.text()).not.toContain('+')
  })
})
