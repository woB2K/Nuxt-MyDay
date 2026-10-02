import type { Category } from '~~/prisma/.generated/prisma'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useCategoriesQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => {
      return api<Category[]>('/api/categories')
    }
  })
}

export function useAddCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      api<Category>('/api/categories', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.categories.addSuccess'))
    },
    onError: () => {
      toast.error(t('toast.categories.addError'))
    }
  })
}

export function useUpdateCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateCategoryInput) =>
      api<Category>(`/api/categories/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.categories.updateSuccess'))
    },
    onError: () => {
      toast.error(t('toast.categories.updateError'))
    }
  })
}

export function useDeleteCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<Category>(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success(t('toast.categories.deleteSuccess'))
    },
    onError: () => {
      toast.error(t('toast.categories.deleteError'))
    }
  })
}
