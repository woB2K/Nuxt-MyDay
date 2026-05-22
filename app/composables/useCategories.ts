import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useCategoriesQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => {
      return api('/api/categories')
    }
  })
}

export function useAddCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      api('/api/categories', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      useAppToast().success(t('toast.categories.addSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.categories.addError'))
    }
  })
}

export function useUpdateCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateCategoryInput) =>
      api(`/api/categories/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      useAppToast().success(t('toast.categories.updateSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.categories.updateError'))
    }
  })
}

export function useDeleteCategoryMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      useAppToast().success(t('toast.categories.deleteSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.categories.deleteError'))
    }
  })
}
