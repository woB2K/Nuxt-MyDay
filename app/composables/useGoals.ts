import type { CreateSavingsGoalInput, SavingsGoalItem, UpdateSavingsGoalInput } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useGoalsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => api<SavingsGoalItem[]>('/api/finance/goals')
  })
}

export function useAddGoalMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateSavingsGoalInput) =>
      api<SavingsGoalItem>('/api/finance/goals', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() })
      toast.success(t('toast.goals.addSuccess'))
    },
    onError: () => {
      toast.error(t('toast.goals.addError'))
    }
  })
}

export function useUpdateGoalMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateSavingsGoalInput) =>
      api<SavingsGoalItem>(`/api/finance/goals/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() })
      toast.success(t('toast.goals.updateSuccess'))
    },
    onError: () => {
      toast.error(t('toast.goals.updateError'))
    }
  })
}

export function useDeleteGoalMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/finance/goals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() })
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success(t('toast.goals.deleteSuccess'))
    },
    onError: () => {
      toast.error(t('toast.goals.deleteError'))
    }
  })
}
