import type { TaskItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { queryKeys } from '../../../app/composables/queryKeys'
import {
  useAddTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
  useToggleTaskMutation
} from '../../../app/composables/useTasks'

const { mockApi, toastSuccess, toastError } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useApi', () => () => mockApi)
mockNuxtImport('useAppToast', () => () => ({ success: toastSuccess, error: toastError, info: () => {} }))
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

function withQueryClient<T>(composable: () => T) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  let result!: T
  const wrapper = mount(
    {
      setup() {
        result = composable()
        return () => h('div')
      }
    },
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  )

  return { result, queryClient, wrapper }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function task(id: string, done = false): TaskItem {
  return {
    id,
    userId: 'user-1',
    title: `Task ${id}`,
    notes: null,
    done,
    doneAt: null,
    priority: 'NONE',
    dueDate: null,
    createdAt: new Date('2026-09-14T09:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z'),
    tags: []
  }
}

const listKey = queryKeys.tasks('all', '')

beforeEach(() => {
  mockApi.mockReset()
  toastSuccess.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTasksQuery', () => {
  it('шлёт фильтр и поиск в query и перезапрашивает при их смене', async () => {
    mockApi.mockResolvedValue([])
    const filter = ref<'all' | 'open' | 'done'>('all')
    const search = ref('')
    const { wrapper } = withQueryClient(() => useTasksQuery(filter, search))

    await vi.waitFor(() => expect(mockApi).toHaveBeenCalledWith('/api/tasks', { query: {} }))

    filter.value = 'open'
    search.value = 'отчёт'

    await vi.waitFor(() => expect(mockApi).toHaveBeenCalledWith('/api/tasks', {
      query: { filter: 'open', search: 'отчёт' }
    }))
    wrapper.unmount()
  })
})

describe('useToggleTaskMutation', () => {
  it('отмечает задачу выполненной в кэше до ответа сервера', async () => {
    const pending = deferred<TaskItem>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleTaskMutation())
    queryClient.setQueryData(listKey, [task('t-1'), task('t-2')])

    result.mutate({ id: 't-1', done: true })

    await vi.waitFor(() => {
      const cached = queryClient.getQueryData<TaskItem[]>(listKey)!
      expect(cached[0]!.done).toBe(true)
      expect(cached[0]!.doneAt).not.toBeNull()
      expect(cached[1]!.done).toBe(false)
    })

    pending.resolve(task('t-1', true))
    wrapper.unmount()
  })

  it('откатывает кэш и показывает ошибку, если сервер отказал', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleTaskMutation())
    queryClient.setQueryData(listKey, [task('t-1')])

    await expect(result.mutateAsync({ id: 't-1', done: true })).rejects.toThrow()

    expect(queryClient.getQueryData<TaskItem[]>(listKey)![0]!.done).toBe(false)
    expect(toastError).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})

describe('useDeleteTaskMutation', () => {
  it('убирает задачу из всех закэшированных списков до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const openKey = queryKeys.tasks('open', '')
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTaskMutation())
    queryClient.setQueryData(listKey, [task('t-1'), task('t-2')])
    queryClient.setQueryData(openKey, [task('t-1')])

    result.mutate('t-1')

    await vi.waitFor(() => {
      expect(queryClient.getQueryData<TaskItem[]>(listKey)).toHaveLength(1)
      expect(queryClient.getQueryData<TaskItem[]>(openKey)).toHaveLength(0)
    })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('возвращает задачу в список при ошибке', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTaskMutation())
    queryClient.setQueryData(listKey, [task('t-1')])

    await expect(result.mutateAsync('t-1')).rejects.toThrow()

    expect(queryClient.getQueryData<TaskItem[]>(listKey)).toHaveLength(1)
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('useAddTaskMutation', () => {
  it('инвалидирует tasks и показывает тост после успеха', async () => {
    mockApi.mockResolvedValueOnce(task('t-3'))
    const { result, queryClient, wrapper } = withQueryClient(() => useAddTaskMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync({ title: 'Новая задача', priority: 'NONE' })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] })
    expect(toastSuccess).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('показывает тост-ошибку и не инвалидирует при отказе сервера', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useAddTaskMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await expect(result.mutateAsync({ title: 'Новая задача', priority: 'NONE' })).rejects.toThrow()

    expect(toastError).toHaveBeenCalledTimes(1)
    expect(invalidate).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
