import type { Transaction } from '~~/prisma/.generated/prisma'
import type { BudgetItem, SavingsEntryItem, SavingsResponse, SummaryResponse, TransactionItem, TransactionListResponse } from '~~/shared/types'
import type { Period } from '~/utils/period'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { periodKey, periodRange } from '~/utils/period'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useSummaryQuery(period: Ref<Period>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.summary(periodKey(period.value))),
    queryFn: () => api<SummaryResponse>('/api/finance/summary', {
      query: periodRange(period.value) ?? {}
    })
  })
}

export function useTransactionQuery(period: Ref<Period>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.transactions(periodKey(period.value))),
    queryFn: () => api<TransactionListResponse>('/api/finance/transactions', {
      query: periodRange(period.value) ?? {}
    })
  })
}

export function useSavingsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.savings(),
    queryFn: () => api<SavingsResponse>('/api/finance/savings')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      useAppToast().success(t('toast.transactions.deleteSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.transactions.deleteError'))
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      useAppToast().success(t('toast.savings.deleteSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.savings.deleteError'))
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
