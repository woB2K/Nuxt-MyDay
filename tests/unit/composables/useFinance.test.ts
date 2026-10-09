import type { SavingsCache, TransactionCache } from '../../../app/utils/financeCache'
import type { SavingsResponse, SummaryResponse, TransactionListResponse } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { queryKeys } from '../../../app/composables/queryKeys'
import {
  useAddTransactionMutation,
  useDeleteSavingsMutation,
  useDeleteTransactionMutation,
  useRestoreSavingsMutation,
  useRestoreTransactionMutation,
  useSummaryQuery
} from '../../../app/composables/useFinance'
import { monthPeriod, periodKey } from '../../../app/utils/period'
import { emptyFilters, filterKey } from '../../../app/utils/transactionFilters'

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
  date: '2026-05-08'
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
          useSummaryQuery(ref(monthPeriod('2026-05-01')), ref(emptyFilters()))
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

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const period = monthPeriod('2026-05-01')
const filters = emptyFilters()
const scope = [periodKey(period), filterKey(filters)] as const

const listKey = queryKeys.transactions(...scope)
const pagesKey = queryKeys.transactionPages(...scope)
const summaryKey = queryKeys.summary(...scope)
const savingsKey = queryKeys.savings(periodKey(period))

function expense(id: string, amount: number) {
  return { id, type: 'EXPENSE', amount, categoryId: 'cat-1', date: new Date('2026-05-08') }
}

function seedTransactions(queryClient: QueryClient) {
  queryClient.setQueryData<TransactionCache>(listKey, {
    data: [expense('tx-1', 250), expense('tx-2', 150)],
    total: 2,
    page: 1,
    limit: 30
  } as TransactionListResponse)

  queryClient.setQueryData<TransactionCache>(pagesKey, {
    pages: [{ data: [expense('tx-1', 250), expense('tx-2', 150)], total: 2, page: 1, limit: 30 }],
    pageParams: [1]
  } as TransactionCache)

  queryClient.setQueryData<SummaryResponse>(summaryKey, {
    income: 1000,
    expense: 400,
    networth: 600,
    breakdownType: 'EXPENSE',
    breakdown: [{ total: 400, category: { id: 'cat-1', name: 'Food', key: null, icon: 'i', color: '#fff' } }]
  })
}

describe('оптимистичное удаление транзакции', () => {
  it('убирает транзакцию из обоих кэшей списка до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    seedTransactions(queryClient)

    result.mutate('tx-1')

    await vi.waitFor(() => {
      expect(queryClient.getQueryData<TransactionListResponse>(listKey)!.data.map(t => t.id)).toEqual(['tx-2'])
      expect(queryClient.getQueryData<{ pages: TransactionListResponse[] }>(pagesKey)!.pages[0]!.total).toBe(1)
    })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('правит summary один раз, хотя транзакция лежала в двух кэшах списка', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    seedTransactions(queryClient)

    result.mutate('tx-1')

    await vi.waitFor(() => {
      const summary = queryClient.getQueryData<SummaryResponse>(summaryKey)!
      expect(summary.expense).toBe(150)
      expect(summary.networth).toBe(850)
      expect(summary.breakdown[0]!.total).toBe(150)
    })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('возвращает транзакцию и summary на место, если сервер отказал', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    seedTransactions(queryClient)

    await expect(result.mutateAsync('tx-1')).rejects.toThrow()

    expect(queryClient.getQueryData<TransactionListResponse>(listKey)!.data).toHaveLength(2)
    expect(queryClient.getQueryData<SummaryResponse>(summaryKey)!.expense).toBe(400)
    expect(toastError).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('не инвалидирует, пока в полёте есть другое удаление', async () => {
    const first = deferred<unknown>()
    const second = deferred<unknown>()
    mockApi.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    seedTransactions(queryClient)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const firstDone = result.mutateAsync('tx-1')
    const secondDone = result.mutateAsync('tx-2')

    first.resolve(undefined)
    await firstDone

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['summary'] })

    second.resolve(undefined)
    await secondDone

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'] })
    wrapper.unmount()
  })
})

describe('оптимистичное удаление накопления', () => {
  function seedSavings(queryClient: QueryClient) {
    queryClient.setQueryData<SavingsCache>(savingsKey, {
      pages: [{
        balance: 1000,
        delta: 300,
        entries: [
          { id: 's-1', type: 'DEPOSIT', amount: 500 },
          { id: 's-2', type: 'WITHDRAWAL', amount: 200 }
        ],
        total: 2,
        page: 1,
        limit: 20
      }] as SavingsResponse[],
      pageParams: [1]
    } as SavingsCache)
  }

  it('убирает запись и пересчитывает баланс до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteSavingsMutation())
    seedSavings(queryClient)

    result.mutate('s-1')

    await vi.waitFor(() => {
      const page = queryClient.getQueryData<SavingsCache>(savingsKey)!.pages[0]!
      expect(page.entries.map(item => item.id)).toEqual(['s-2'])
      expect(page.balance).toBe(500)
      expect(page.delta).toBe(-200)
    })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('возвращает запись и баланс на место при ошибке', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteSavingsMutation())
    seedSavings(queryClient)

    await expect(result.mutateAsync('s-1')).rejects.toThrow()

    const page = queryClient.getQueryData<SavingsCache>(savingsKey)!.pages[0]!
    expect(page.entries).toHaveLength(2)
    expect(page.balance).toBe(1000)
    expect(toastError).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})

describe('undo удаления в финансах', () => {
  it('после удаления транзакции показывает тост с «Отменить», который её восстанавливает', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, wrapper } = withQueryClient(() => useDeleteTransactionMutation())
    await result.mutateAsync('tx-1')
    mockApi.mockResolvedValueOnce(undefined)

    const [message, action] = toastSuccess.mock.calls[0]!
    action.run()

    expect(message).toBe('toast.transactions.deleteSuccess')
    expect(action.label).toBe('general.undo')
    await vi.waitFor(() => expect(mockApi).toHaveBeenLastCalledWith('/api/finance/transactions/tx-1/restore', { method: 'POST' }))
    wrapper.unmount()
  })

  it('после удаления записи копилки показывает тост с «Отменить», который её восстанавливает', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, wrapper } = withQueryClient(() => useDeleteSavingsMutation())
    await result.mutateAsync('s-1')
    mockApi.mockResolvedValueOnce(undefined)

    const [message, action] = toastSuccess.mock.calls[0]!
    action.run()

    expect(message).toBe('toast.savings.deleteSuccess')
    expect(action.label).toBe('general.undo')
    await vi.waitFor(() => expect(mockApi).toHaveBeenLastCalledWith('/api/finance/savings/s-1/restore', { method: 'POST' }))
    wrapper.unmount()
  })

  it('удаление транзакции и записи копилки инвалидирует корзину', async () => {
    mockApi.mockResolvedValue(undefined)
    const { result, queryClient, wrapper } = withQueryClient(() => ({
      tx: useDeleteTransactionMutation(),
      savings: useDeleteSavingsMutation()
    }))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.tx.mutateAsync('tx-1')
    await result.savings.mutateAsync('s-1')

    expect(invalidate.mock.calls.filter(([arg]) => JSON.stringify(arg) === '{"queryKey":["trash"]}')).toHaveLength(2)
    wrapper.unmount()
  })
})

describe('useRestoreTransactionMutation', () => {
  it('восстанавливает транзакцию и обновляет список, сводку и корзину', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, queryClient, wrapper } = withQueryClient(() => useRestoreTransactionMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('tx-1')

    expect(toastSuccess).toHaveBeenCalledWith('toast.transactions.restoreSuccess')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trash'] })
    wrapper.unmount()
  })

  it('показывает ошибку, если восстановить не вышло', async () => {
    mockApi.mockRejectedValueOnce(new Error('404'))
    const { result, wrapper } = withQueryClient(() => useRestoreTransactionMutation())

    await expect(result.mutateAsync('tx-1')).rejects.toThrow()

    expect(toastError).toHaveBeenCalledWith('toast.transactions.restoreError')
    wrapper.unmount()
  })
})

describe('useRestoreSavingsMutation', () => {
  it('восстанавливает запись и обновляет копилку и корзину', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, queryClient, wrapper } = withQueryClient(() => useRestoreSavingsMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('s-1')

    expect(mockApi).toHaveBeenCalledWith('/api/finance/savings/s-1/restore', { method: 'POST' })
    expect(toastSuccess).toHaveBeenCalledWith('toast.savings.restoreSuccess')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['savings'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trash'] })
    wrapper.unmount()
  })

  it('на 409 объясняет, что начальный остаток уже задан', async () => {
    mockApi.mockRejectedValueOnce(Object.assign(new Error('Conflict'), { statusCode: 409 }))
    const { result, wrapper } = withQueryClient(() => useRestoreSavingsMutation())

    await expect(result.mutateAsync('s-1')).rejects.toThrow()

    expect(toastError).toHaveBeenCalledWith('toast.savings.restoreOpeningConflict')
    wrapper.unmount()
  })

  it('на прочие ошибки показывает общий текст', async () => {
    mockApi.mockRejectedValueOnce(Object.assign(new Error('Not found'), { statusCode: 404 }))
    const { result, wrapper } = withQueryClient(() => useRestoreSavingsMutation())

    await expect(result.mutateAsync('s-1')).rejects.toThrow()

    expect(toastError).toHaveBeenCalledWith('toast.savings.restoreError')
    wrapper.unmount()
  })
})
