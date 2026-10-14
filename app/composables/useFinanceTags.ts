import type { CreateFinanceTagInput, FinanceTagItem } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { invalidateWhenSettled, restoreQueries, snapshotQueries } from '~/utils/optimistic'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useFinanceTagsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.financeTags(),
    queryFn: () => api<FinanceTagItem[]>('/api/finance/tags')
  })
}

export function useAddFinanceTagMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateFinanceTagInput) =>
      api<FinanceTagItem>('/api/finance/tags', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTags() })
    },
    onError: () => {
      toast.error(t('toast.tags.addError'))
    }
  })
}

export function useDeleteFinanceTagMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<FinanceTagItem>(`/api/finance/tags/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, queryKeys.financeTags())

      queryClient.setQueryData<FinanceTagItem[]>(queryKeys.financeTags(), tags => tags?.filter(tag => tag.id !== id))

      return { previous }
    },
    onSuccess: () => {
      toast.success(t('toast.tags.deleteSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.tags.deleteError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, queryKeys.financeTags(), ['transactions'], ['summary'])
    }
  })
}

export function useFinanceTagNames() {
  const { data } = useFinanceTagsQuery()

  const names = computed(() => new Map((data.value ?? []).map(tag => [tag.id, tag.name])))

  return (tagIds: string[]) => tagIds.flatMap((id) => {
    const name = names.value.get(id)
    return name ? [name] : []
  })
}
