import type { QueryClient, QueryKey } from '@tanstack/vue-query'
import type { Transaction } from '~~/prisma/.generated/prisma'
import type { BudgetItem, SavingsEntryItem, SavingsResponse, SummaryResponse, TransactionItem, TransactionListResponse } from '~~/shared/types'
import type { SavingsCache, TransactionCache } from '~/utils/financeCache'
import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { cachedTransactions, dropFromSummary, dropSavingsEntry, dropTransaction } from '~/utils/financeCache'
import { invalidateWhenSettled, restoreQueries, snapshotQueries } from '~/utils/optimistic'
import { periodKey, periodRange } from '~/utils/period'
import { filterKey, filterQuery } from '~/utils/transactionFilters'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

function toQuery(period: Period, filters: TransactionFilters): Record<string, string> {
  return { ...periodRange(period), ...filterQuery(filters) }
}

function removeTransactionFromCaches(queryClient: QueryClient, id: string) {
  const lists = queryClient.getQueriesData<TransactionCache>({ queryKey: ['transactions'] })
  const removed = lists
    .flatMap(([, cache]) => cachedTransactions(cache))
    .find(transaction => transaction.id === id)

  const summaryKeys = new Map<string, QueryKey>()

  lists.forEach(([key, cache]) => {
    if (!cache) return

    const next = dropTransaction(cache, id)
    if (next === cache) return

    queryClient.setQueryData(key, next)

    const scope = key.at(-1)
    summaryKeys.set(JSON.stringify(scope), ['summary', scope])
  })

  if (!removed) return

  summaryKeys.forEach(key => queryClient.setQueryData<SummaryResponse>(
    key,
    summary => summary && dropFromSummary(summary, removed)
  ))
}

export function useSummaryQuery(period: Ref<Period>, filters: Ref<TransactionFilters>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.summary(periodKey(period.value), filterKey(filters.value))),
    queryFn: () => api<SummaryResponse>('/api/finance/summary', {
      query: toQuery(period.value, filters.value)
    })
  })
}

export function useTransactionQuery(period: Ref<Period>, filters: Ref<TransactionFilters>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.transactions(periodKey(period.value), filterKey(filters.value))),
    queryFn: () => api<TransactionListResponse>('/api/finance/transactions', {
      query: toQuery(period.value, filters.value)
    })
  })
}

export function useTransactionPagesQuery(period: Ref<Period>, filters: Ref<TransactionFilters>, limit = 30) {
  const api = useApi()

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.transactionPages(periodKey(period.value), filterKey(filters.value))),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<TransactionListResponse>('/api/finance/transactions', {
      query: { ...toQuery(period.value, filters.value), page: pageParam, limit }
    }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    }
  })
}

export function useSavingsQuery(period: Ref<Period>, limit = 20) {
  const api = useApi()

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.savings(periodKey(period.value))),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<SavingsResponse>('/api/finance/savings', {
      query: { ...periodRange(period.value), page: pageParam, limit }
    }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    }
  })
}

export function useBudgetQuery(period: Ref<Period>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.budgets(periodKey(period.value))),
    queryFn: () => api<BudgetItem[]>('/api/finance/budgets', {
      query: periodRange(period.value) ?? {}
    })
  })
}

export function useAddTransactionMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      api<Transaction>('/api/finance/transactions', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      useAppToast().success(t('toast.transactions.addSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.transactions.addError'))
    }
  })
}

export function useUpdateTransactionMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTransactionInput) =>
      api<TransactionItem>(`/api/finance/transactions/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      useAppToast().success(t('toast.transactions.updateSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.transactions.updateError'))
    }
  })
}

export function useDeleteTransactionMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: string) =>
      api<TransactionItem>(`/api/finance/transactions/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['transactions'], ['summary'])

      removeTransactionFromCaches(queryClient, id)

      return { previous }
    },
    onSuccess: () => {
      useAppToast().success(t('toast.transactions.deleteSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      useAppToast().error(t('toast.transactions.deleteError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, ['transactions'], ['summary'])
    }
  })
}

export function useAddSavingsMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (data: CreateSavingsSchema) =>
      api<SavingsEntryItem>('/api/finance/savings', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      useAppToast().success(t('toast.savings.addSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.savings.addError'))
    }
  })
}

export function useDeleteSavingsMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: string) =>
      api<SavingsEntryItem>(`/api/finance/savings/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['savings'])

      queryClient.setQueriesData<SavingsCache>(
        { queryKey: ['savings'] },
        cache => cache && dropSavingsEntry(cache, id)
      )

      return { previous }
    },
    onSuccess: () => {
      useAppToast().success(t('toast.savings.deleteSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      useAppToast().error(t('toast.savings.deleteError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, ['savings'])
    }
  })
}

export function useUpsertBudgetMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (body: UpdateBudgetInput) =>
      api<BudgetItem>('/api/finance/budgets', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      useAppToast().success(t('toast.budgets.saveSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.budgets.saveError'))
    }
  })
}
