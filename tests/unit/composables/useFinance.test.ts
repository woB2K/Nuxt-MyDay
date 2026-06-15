import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import {
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useSummaryQuery
} from '../../../app/composables/useFinance'

// Хуки дёргают эти Nuxt auto-import'ы. Мокаем их, чтобы тест не тащил
// реальный $fetch, стор тостов и i18n-конфиг. vi.hoisted — потому что
// mockNuxtImport поднимает фабрику выше объявлений переменных.
const { mockApi, toastSuccess, toastError } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useApi', () => () => mockApi)
mockNuxtImport('useAppToast', () => () => ({ success: toastSuccess, error: toastError, info: () => {} }))
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

// Запускает composable внутри setup() с собственным QueryClient — иначе
// useMutation/useQuery не найдут инжектнутый клиент и упадут.
function withQueryClient<T>(composable: () => T) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  let result!: T
  const wrapper = mount(
    {
      setup() {
        result = composable()
        return () => h('div')
      }
    },
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  )

  return { result, queryClient, wrapper }
}

const validTx = {
  type: 'EXPENSE' as const,
  amount: 150,
  categoryId: 'cat-1',
  date: '2026-05-08T00:00:00.000Z'
}

beforeEach(() => {
  mockApi.mockReset()
  toastSuccess.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useAddTransactionMutation', () => {
  it('инвалидирует transactions и summary после успешной мутации', async () => {
    mockApi.mockResolvedValueOnce({ id: 'tx-1', ...validTx })
    const { result, queryClient, wrapper } = withQueryClient(() => useAddTransactionMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync(validTx)

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'] })
    expect(toastSuccess).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('показывает тост-ошибку и не инвалидирует при отказе сервера', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useAddTransactionMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await expect(result.mutateAsync(validTx)).rejects.toThrow()

    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('useSummaryQuery инвалидация после добавления транзакции', () => {
  it('активный summary-запрос рефетчится после успешного add', async () => {
    let summaryFetches = 0
    mockApi.mockImplementation((url: string) => {
      if (url === '/api/finance/summary') {
        summaryFetches += 1
        return Promise.resolve({ income: 0, expense: 0, net: 0, byCategory: [] })
      }
      // POST /api/finance/transactions
      return Promise.resolve({ id: 'tx-1', ...validTx })
    })

    // Оба хука живут под одним QueryClient — инвалидация из мутации
    // должна достучаться до наблюдателя summary-запроса.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    let add!: ReturnType<typeof useAddTransactionMutation>
    const wrapper = mount(
      {
        setup() {
          // Запрос нужен лишь как активный наблюдатель — ссылка не используется.
          useSummaryQuery(ref(new Date('2026-05-15T00:00:00.000Z')))
          add = useAddTransactionMutation()
          return () => h('div')
        }
      },
      { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
    )

    // Ждём первый фетч summary при монтировании.
    await vi.waitFor(() => expect(summaryFetches).toBe(1))

    await add.mutateAsync(validTx)

    // invalidateQueries({ queryKey: ['summary'] }) → рефетч активного наблюдателя.
    await vi.waitFor(() => expect(summaryFetches).toBe(2))
    wrapper.unmount()
  })
})

describe('useDeleteTransactionMutation', () => {
  it('инвалидирует transactions и summary после удаления', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('tx-1')

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'] })
    expect(toastSuccess).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('показывает тост-ошибку при отказе сервера', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, wrapper } = withQueryClient(() => useDeleteTransactionMutation())

    await expect(result.mutateAsync('tx-1')).rejects.toThrow()

    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
