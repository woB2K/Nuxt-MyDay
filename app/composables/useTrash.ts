import type { TrashKind, TrashResponse } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { restoreQueries, snapshotQueries } from '~/utils/optimistic'
import { dropFromTrash, emptyTrash } from '~/utils/trash'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useTrashQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.trash(),
    queryFn: () => api<TrashResponse>('/api/trash')
  })
}

export function useDeleteForeverMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ kind, id }: { kind: TrashKind, id: string }) =>
      api(`/api/trash/${kind}/${id}`, { method: 'DELETE' }),
    onMutate: async ({ kind, id }) => {
      const previous = await snapshotQueries(queryClient, ['trash'])

      queryClient.setQueryData<TrashResponse>(queryKeys.trash(), cache => cache && dropFromTrash(cache, kind, id))

      return { previous }
    },
    onSuccess: () => {
      toast.success(t('toast.trash.deleteSuccess'))
    },
    onError: (_error, _item, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.trash.deleteError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
    }
  })
}

export function useEmptyTrashMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: () => api<{ deleted: number }>('/api/trash', { method: 'DELETE' }),
    onMutate: async () => {
      const previous = await snapshotQueries(queryClient, ['trash'])

      queryClient.setQueryData<TrashResponse>(queryKeys.trash(), emptyTrash())

      return { previous }
    },
    onSuccess: () => {
      toast.success(t('toast.trash.emptySuccess'))
    },
    onError: (_error, _vars, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.trash.emptyError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
    }
  })
}
