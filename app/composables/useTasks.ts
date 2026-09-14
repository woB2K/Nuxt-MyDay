import type { QueryClient, QueryKey } from '@tanstack/vue-query'
import type { Tag, Task } from '~~/prisma/.generated/prisma'
import type { CreateTagInput, CreateTaskInput, TaskItem, TemplateItem, UpdateTaskInput } from '~~/shared/types'
import type { TaskFilter } from '~/utils/taskFilters'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { taskQuery } from '~/utils/taskFilters'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

type TaskListSnapshot = [QueryKey, TaskItem[] | undefined][]

async function snapshotTasks(queryClient: QueryClient): Promise<TaskListSnapshot> {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })

  return queryClient.getQueriesData<TaskItem[]>({ queryKey: ['tasks'] })
}

function patchTaskLists(queryClient: QueryClient, patch: (tasks: TaskItem[]) => TaskItem[]) {
  queryClient.setQueriesData<TaskItem[]>({ queryKey: ['tasks'] }, tasks => tasks && patch(tasks))
}

function restoreTaskLists(queryClient: QueryClient, snapshot: TaskListSnapshot = []) {
  snapshot.forEach(([key, tasks]) => queryClient.setQueryData(key, tasks))
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

export function useAddTagMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (data: CreateTagInput) =>
      api<Tag>('/api/tags', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: () => {
      useAppToast().error(t('toast.tags.addError'))
    }
  })
}

export function useAddTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      api<TaskItem>('/api/tasks', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      useAppToast().success(t('toast.tasks.addSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.tasks.addError'))
    }
  })
}

export function useUpdateTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTaskInput) =>
      api<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      useAppToast().success(t('toast.tasks.updateSuccess'))
    },
    onError: () => {
      useAppToast().error(t('toast.tasks.updateError'))
    }
  })
}

export function useToggleTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ id, done }: { id: string, done: boolean }) =>
      api<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', body: { done } }),
    onMutate: async ({ id, done }) => {
      const previous = await snapshotTasks(queryClient)

      patchTaskLists(queryClient, tasks => tasks.map(task => task.id === id
        ? { ...task, done, doneAt: done ? new Date() : null }
        : task))

      return { previous }
    },
    onError: (_error, _variables, context) => {
      restoreTaskLists(queryClient, context?.previous)
      useAppToast().error(t('toast.tasks.updateError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useDeleteTaskMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: string) =>
      api<Task>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const previous = await snapshotTasks(queryClient)

      patchTaskLists(queryClient, tasks => tasks.filter(task => task.id !== id))

      return { previous }
    },
    onSuccess: () => {
      useAppToast().success(t('toast.tasks.deleteSuccess'))
    },
    onError: (_error, _id, context) => {
      restoreTaskLists(queryClient, context?.previous)
      useAppToast().error(t('toast.tasks.deleteError'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
