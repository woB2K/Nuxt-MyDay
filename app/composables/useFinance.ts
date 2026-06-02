import type { Transaction } from '~~/prisma/.generated/prisma'
import type { BudgetItem, SavingsResponse, SummaryResponse, TransactionListResponse } from '~~/shared/types/finance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useSummaryQuery(month: Ref<Date>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.summary(
      `${month.value.getFullYear()}-${String(month.value.getMonth() + 1).padStart(2, '0')}`
    )),
    queryFn: () => {
      const y = month.value.getFullYear()
      const m = month.value.getMonth()
      const from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
      const to = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10)
      return api<SummaryResponse>('/api/finance/summary', { query: { from, to } })
    }
  })
}

export function useTransactionQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.transactions('all'),
    queryFn: () => api<TransactionListResponse>('/api/finance/transactions')
  })
}

export function useSavingsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.savings(),
    queryFn: () => api<SavingsResponse>('/api/finance/savings')
  })
}

export function useBudgetQuery(month: Ref<Date>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.budgets(
      `${month.value.getFullYear()}-${String(month.value.getMonth() + 1).padStart(2, '0')}`
    )),
    queryFn: () => {
      const y = month.value.getFullYear()
      const m = month.value.getMonth()
      const from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
      const to = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10)
      return api<BudgetItem[]>('/api/finance/budgets', { query: { from, to } })
    }
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
      api(`/api/finance/transactions/${id}`, { method: 'PATCH', body: data }),
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
      api(`/api/finance/transactions/${id}`, { method: 'DELETE' }),
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
      api('/api/finance/savings', { method: 'POST', body: data }),
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
      api(`/api/finance/savings/${id}`, { method: 'DELETE' }),
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
      api('/api/finance/budgets/', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      useAppToast().success(t('toast.budgets.saveSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.budgets.saveError'))
    }
  })
}
