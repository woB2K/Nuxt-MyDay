import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionEditSheet from '../../../app/components/features/finance/TransactionEditSheet.vue'

const { state, addMutate, updateMutate, deleteMutate, toastError } = vi.hoisted(() => ({
  state: {
    categories: {
      value: [
        { id: 'exp-1', name: 'Food', type: 'EXPENSE', icon: 'i-lucide-utensils', color: '#FB923C' },
        { id: 'exp-2', name: 'Transport', type: 'EXPENSE', icon: 'i-lucide-car', color: '#60A5FA' },
        { id: 'inc-1', name: 'Salary', type: 'INCOME', icon: 'i-lucide-wallet', color: '#34D399' }
      ]
    }
  },
  addMutate: vi.fn(),
  updateMutate: vi.fn(),
  deleteMutate: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: toastError, info: () => {} }))
mockNuxtImport('useCategoriesQuery', () => () => ({ data: state.categories }))
mockNuxtImport('useAddTransactionMutation', () => () => ({ mutate: addMutate, isPending: { value: false } }))
mockNuxtImport('useUpdateTransactionMutation', () => () => ({ mutate: updateMutate, isPending: { value: false } }))
mockNuxtImport('useDeleteTransactionMutation', () => () => ({ mutate: deleteMutate, isPending: { value: false } }))

const existing = {
  id: 'tx-1',
  type: 'EXPENSE',
  amount: 250,
  categoryId: 'exp-2',
  notes: 'Такси',
  date: '2026-05-08T00:00:00.000Z'
}

function mountSheet(transaction: unknown = null) {
  return mount(TransactionEditSheet, {
    props: { open: true, transaction },
    global: {
      stubs: {
        UiSheet: { template: '<div><slot /></div>' },
        UiPillSelect: true,
        UiCategoryTile: true,
        UiInput: true,
        UiButton: { template: '<button type="submit"><slot /></button>' },
        UIcon: true
      }
    }
  })
}

function amountField(wrapper: ReturnType<typeof mountSheet>) {
  return wrapper.find('input[inputmode="decimal"]')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 11, 22, 30))
  addMutate.mockReset()
  updateMutate.mockReset()
  deleteMutate.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('transactionEditSheet — создание', () => {
  it('шлёт дату календарным днём клиента, а не UTC-моментом', async () => {
    const wrapper = mountSheet()

    await amountField(wrapper).setValue('150')
    await wrapper.findAllComponents({ name: 'UiCategoryTile' })[0]!.trigger('click')
    await wrapper.find('form').trigger('submit')

    expect(addMutate).toHaveBeenCalledTimes(1)
    expect(addMutate.mock.calls[0]![0]).toMatchObject({
      type: 'EXPENSE',
      amount: 150,
      categoryId: 'exp-1',
      date: '2026-09-11'
    })
  })

  it('не отправляет запрос при нулевой сумме', async () => {
    const wrapper = mountSheet()

    await amountField(wrapper).setValue('0')
    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledWith('finance.error.amount')
  })

  it('не отправляет запрос без категории', async () => {
    const wrapper = mountSheet()

    await amountField(wrapper).setValue('150')
    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledWith('finance.error.category')
  })

  it('в режиме создания кнопки удаления нет', () => {
    expect(mountSheet().text()).not.toContain('finance.deleteTransaction')
  })
})

describe('transactionEditSheet — редактирование', () => {
  it('подставляет значения транзакции, включая календарный день', () => {
    const wrapper = mountSheet(existing)

    expect((amountField(wrapper).element as HTMLInputElement).value).toBe('250')
    expect((wrapper.find('input[type="date"]').element as HTMLInputElement).value).toBe('2026-05-08')
  })

  it('шлёт PATCH с id транзакции', async () => {
    const wrapper = mountSheet(existing)

    await amountField(wrapper).setValue('300')
    await wrapper.find('form').trigger('submit')

    expect(updateMutate).toHaveBeenCalledTimes(1)
    expect(updateMutate.mock.calls[0]![0]).toMatchObject({ id: 'tx-1', amount: 300, categoryId: 'exp-2' })
  })

  it('смена типа сбрасывает категорию на первую подходящую — иначе сервер вернёт 400', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.findComponent({ name: 'UiPillSelect' }).vm.$emit('update:modelValue', 'INCOME')
    await wrapper.find('form').trigger('submit')

    expect(updateMutate.mock.calls[0]![0]).toMatchObject({ type: 'INCOME', categoryId: 'inc-1' })
  })

  it('удаляет транзакцию по кнопке', async () => {
    const wrapper = mountSheet(existing)

    await wrapper.find('button[type="button"]').trigger('click')

    expect(deleteMutate).toHaveBeenCalledTimes(1)
    expect(deleteMutate.mock.calls[0]![0]).toBe('tx-1')
  })
})

describe('transactionEditSheet — обратная связь при незаполненной форме', () => {
  it('пустая сумма: ошибка стоит под полем, а не только в тосте', async () => {
    const wrapper = mountSheet()

    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledWith('finance.error.amount')
    expect(wrapper.text()).toContain('finance.error.amount')
  })

  it('ошибка уходит, как только пользователь начал вводить сумму', async () => {
    const wrapper = mountSheet()

    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('finance.error.amount')

    await amountField(wrapper).setValue('150')

    expect(wrapper.text()).not.toContain('finance.error.amount')
  })

  it('невыбранная категория тоже объясняется под полем', async () => {
    state.categories.value = []
    const wrapper = mountSheet()

    await amountField(wrapper).setValue('150')
    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('finance.error.category')

    state.categories.value = [
      { id: 'exp-1', name: 'Food', type: 'EXPENSE', icon: 'i-lucide-utensils', color: '#FB923C' },
      { id: 'exp-2', name: 'Transport', type: 'EXPENSE', icon: 'i-lucide-car', color: '#60A5FA' },
      { id: 'inc-1', name: 'Salary', type: 'INCOME', icon: 'i-lucide-wallet', color: '#34D399' }
    ]
  })
})
