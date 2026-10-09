import type { QueryClient } from '@tanstack/vue-query'
import type { Tag, Task } from '~~/prisma/.generated/prisma'
import type {
  CreateTagInput,
  CreateTaskInput,
  CreateTemplateInput,
  TaskItem,
  TemplateItem,
  TrashResponse,
  UpdateTaskInput,
  UpdateTemplateInput
} from '~~/shared/types'
import type { TaskFilter } from '~/utils/taskFilters'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { invalidateWhenSettled, restoreQueries, snapshotQueries } from '~/utils/optimistic'
import { taskQuery } from '~/utils/taskFilters'
import { dropFromTrash } from '~/utils/trash'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

function patchTaskLists(queryClient: QueryClient, patch: (tasks: TaskItem[]) => TaskItem[]) {
  queryClient.setQueriesData<TaskItem[]>({ queryKey: ['tasks'] }, tasks => tasks && patch(tasks))
}

export function useTasksQuery(filter: Ref<TaskFilter>, search: Ref<string>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.tasks(filter.value, search.value)),
    queryFn: () => api<TaskItem[]>('/api/tasks', {
      query: taskQuery(filter.value, search.value)
    })
  })
}

export function useTagsQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: () => api<Tag[]>('/api/tags')
  })
}

export function useTemplatesQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.templates(),
    queryFn: () => api<TemplateItem[]>('/api/templates')
  })
}

export function useAddTemplateMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateTemplateInput) =>
      api<TemplateItem>('/api/templates', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success(t('toast.templates.addSuccess'))
    },
    onError: () => {
      toast.error(t('toast.templates.addError'))
    }
  })
}

export function useUpdateTemplateMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTemplateInput) =>
      api<TemplateItem>(`/api/templates/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success(t('toast.templates.updateSuccess'))
    },
    onError: () => {
      toast.error(t('toast.templates.updateError'))
    }
  })
}

export function useDeleteTemplateMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<TemplateItem>(`/api/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success(t('toast.templates.deleteSuccess'))
    },
    onError: () => {
      toast.error(t('toast.templates.deleteError'))
    }
  })
}

export function useAddTagMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateTagInput) =>
      api<Tag>('/api/tags', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: () => {
      toast.error(t('toast.tags.addError'))
    }
  })
}

export function useDeleteTagMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<Tag>(`/api/tags/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['tags'], ['tasks'])

      queryClient.setQueryData<Tag[]>(queryKeys.tags(), tags => tags?.filter(tag => tag.id !== id))
      patchTaskLists(queryClient, tasks => tasks.map(task => ({
        ...task,
        tags: task.tags.filter(tag => tag.id !== id)
      })))

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
      invalidateWhenSettled(queryClient, ['tags'], ['tasks'], ['templates'])
    }
  })
}

export function useAddTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      api<TaskItem>('/api/tasks', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(t('toast.tasks.addSuccess'))
    },
    onError: () => {
      toast.error(t('toast.tasks.addError'))
    }
  })
}

export function useUpdateTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTaskInput) =>
      api<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(t('toast.tasks.updateSuccess'))
    },
    onError: () => {
      toast.error(t('toast.tasks.updateError'))
    }
  })
}

export function useToggleTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ id, done }: { id: string, done: boolean }) =>
      api<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', body: { done } }),
    onMutate: async ({ id, done }) => {
      const previous = await snapshotQueries(queryClient, ['tasks'])

      patchTaskLists(queryClient, tasks => tasks.map(task => task.id === id
        ? { ...task, done, doneAt: done ? new Date() : null }
        : task))

      return { previous }
    },
    onError: (_error, _variables, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.tasks.updateError'))
    },
    onSettled: () => {
      invalidateWhenSettled(queryClient, ['tasks'])
    }
  })
}

export function useRestoreTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (id: string) =>
      api<TaskItem>(`/api/tasks/${id}/restore`, { method: 'POST' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['trash'])

      queryClient.setQueryData<TrashResponse>(queryKeys.trash(), cache => cache && dropFromTrash(cache, 'task', id))

      return { previous }
    },
    onSuccess: () => {
      toast.success(t('toast.tasks.restoreSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.tasks.restoreError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['trash'] })
    }
  })
}

export function useDeleteTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()
  const { mutate: restore } = useRestoreTaskMutation()

  return useMutation({
    mutationFn: (id: string) =>
      api<Task>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotQueries(queryClient, ['tasks'])

      patchTaskLists(queryClient, tasks => tasks.filter(task => task.id !== id))

      return { previous }
    },
    onSuccess: (_task, id) => {
      toast.success(t('toast.tasks.deleteSuccess'), { label: t('general.undo'), run: () => restore(id) })
    },
    onError: (_error, _id, context) => {
      restoreQueries(queryClient, context?.previous)
      toast.error(t('toast.tasks.deleteError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
      invalidateWhenSettled(queryClient, ['tasks'])
    }
  })
}
