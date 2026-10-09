import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SavingsOpSheet from '../../../app/components/features/finance/SavingsOpSheet.vue'

const { addMutate, updateMutate, toastError } = vi.hoisted(() => ({
  addMutate: vi.fn(),
  updateMutate: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: toastError, info: () => {} }))
mockNuxtImport('useAddSavingsMutation', () => () => ({ mutate: addMutate, isPending: { value: false } }))
mockNuxtImport('useUpdateSavingsMutation', () => () => ({ mutate: updateMutate, isPending: { value: false } }))

const withdrawal = {
  id: 'sv-1',
  type: 'WITHDRAWAL',
  amount: 3000,
  notes: 'Отпуск',
  userId: 'u-1',
  createdAt: '2026-10-01T10:00:00.000Z'
}

function mountSheet(props: Record<string, unknown> = {}) {
  return mount(SavingsOpSheet, {
    props: { open: true, mode: 'DEPOSIT', balance: 1000, ...props },
    global: {
      stubs: {
        UiSheet: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /></div>' },
        UiInput: true,
        UiChip: true,
        UiButton: { template: '<button type="submit"><slot /></button>' }
      }
    }
  })
}

function amountField(wrapper: ReturnType<typeof mountSheet>) {
  return wrapper.find('input[inputmode="decimal"]')
}

beforeEach(() => {
  addMutate.mockReset()
  updateMutate.mockReset()
  toastError.mockReset()
})

describe('savingsOpSheet — создание', () => {
  it('шлёт POST с выбранным типом', async () => {
    const wrapper = mountSheet()

    await amountField(wrapper).setValue('500')
    await wrapper.find('form').trigger('submit')

    expect(addMutate.mock.calls[0]![0]).toMatchObject({ type: 'DEPOSIT', amount: 500 })
    expect(updateMutate).not.toHaveBeenCalled()
  })
})

describe('savingsOpSheet — редактирование', () => {
  it('подставляет сумму и заголовок редактирования', () => {
    const wrapper = mountSheet({ entry: withdrawal })

    expect((amountField(wrapper).element as HTMLInputElement).value.replace(/\s/g, '')).toBe('3000')
    expect(wrapper.find('h2').text()).toBe('finance.savings.editTitle')
    expect(wrapper.text()).toContain('general.save')
  })

  it('шлёт PATCH с id записи и без типа', async () => {
    const wrapper = mountSheet({ entry: withdrawal })

    await amountField(wrapper).setValue('3500')
    await wrapper.find('form').trigger('submit')

    expect(addMutate).not.toHaveBeenCalled()
    expect(updateMutate.mock.calls[0]![0]).toEqual({ id: 'sv-1', amount: 3500, notes: 'Отпуск' })
  })

  it('при правке снятия считает доступным баланс вместе с текущей суммой записи', async () => {
    const wrapper = mountSheet({ entry: withdrawal, balance: 1000 })

    await amountField(wrapper).setValue('4000')
    await wrapper.find('form').trigger('submit')
    expect(updateMutate).toHaveBeenCalledTimes(1)

    await amountField(wrapper).setValue('4001')
    await wrapper.find('form').trigger('submit')
    expect(updateMutate).toHaveBeenCalledTimes(1)
    expect(toastError).toHaveBeenCalledWith('finance.savings.notEnough')
  })

  it('для стартового остатка оставляет его заголовок', () => {
    const wrapper = mountSheet({ entry: { ...withdrawal, type: 'OPENING' } })

    expect(wrapper.find('h2').text()).toBe('finance.savings.opening')
  })
})
