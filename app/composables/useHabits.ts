import type { CreateHabitInput, HabitItem, TrashResponse, UpdateHabitInput } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toDateString } from '~/utils/formatDate'
import { orderHabits, withMark } from '~/utils/habits'
import { invalidateWhenSettled, restoreQueries, snapshotQueries } from '~/utils/optimistic'
import { dropFromTrash } from '~/utils/trash'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

export function useHabitsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.habits(),
    queryFn: () => api<HabitItem[]>('/api/habits')
  })
}

export function useAddHabitMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateHabitInput) =>
      api<HabitItem>('/api/habits', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      toast.success(t('toast.habits.added'))
    },
    onError: () => {
      toast.error(t('toast.habits.addError'))
    }
  })
}

export function useUpdateHabitMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateHabitInput) =>
      api<HabitItem>(`/api/habits/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      toast.success(t('toast.habits.saved'))
    },
    onError: () => {
      toast.error(t('toast.habits.updateError'))
    }
  })
}

export function useToggleHabitMarkMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    scope: { id: 'habit-marks' },
    mutationFn: ({ id, date, marked }: { id: string, date: string, marked: boolean }) =>
      api<HabitItem>(`/api/habits/${id}/marks/${date}`, {
        method: marked ? 'PUT' : 'DELETE',
        query: { today: toDateString() }
      }),
    onMutate: async ({ id, date, marked }) => {
      const previous = await snapshotQueries(queryClient, ['habits'])

      queryClient.setQueryData<HabitItem[]>(queryKeys.habits(), habits => habits?.map(habit => habit.id === id
        ? withMark(habit, date, marked)
        : habit))

      return { previous }
    },
    onError: (_error, _variables, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.habits.markError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, ['habits'])
    }
  })
}

export function useReorderHabitsMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (ids: string[]) =>
      api<{ ids: string[] }>('/api/habits/order', { method: 'PUT', body: { ids } }),
    onMutate: async (ids) => {
      const previous = await snapshotQueries(queryClient, ['habits'])

      queryClient.setQueryData<HabitItem[]>(queryKeys.habits(), habits => habits && orderHabits(habits, ids))

      return { previous }
    },
    onError: (_error, _ids, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.habits.reorderError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, ['habits'])
    }
  })
}

export function useRestoreHabitMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<HabitItem>(`/api/habits/${id}/restore`, { method: 'POST' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['trash'])

      queryClient.setQueryData<TrashResponse>(queryKeys.trash(), cache => cache && dropFromTrash(cache, 'habit', id))

      return { previous }
    },
    onSuccess: () => {
      toast.success(t('toast.habits.restoreSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.habits.restoreError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['trash'] })
    }
  })
}

export function useDeleteHabitMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()
  const { mutate: restore } = useRestoreHabitMutation()

  return useMutation({
    mutationFn: ({ id }: Pick<HabitItem, 'id' | 'name'>) =>
      api<HabitItem>(`/api/habits/${id}`, { method: 'DELETE' }),
    onMutate: async ({ id }) => {
      const previous = await snapshotQueries(queryClient, ['habits'])

      queryClient.setQueryData<HabitItem[]>(queryKeys.habits(), habits => habits?.filter(habit => habit.id !== id))

      return { previous }
    },
    onSuccess: (_habit, { id, name }) => {
      toast.success(t('toast.habits.deleted', { name }), { label: t('general.undo'), run: () => restore(id) })
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.habits.deleteError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
      invalidateWhenSettled(queryClient, ['habits'])
    }
  })
}
