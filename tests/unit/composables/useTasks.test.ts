import type { Tag } from '../../../prisma/.generated/prisma'
import type { TaskItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { queryKeys } from '../../../app/composables/queryKeys'
import {
  useAddTaskMutation,
  useDeleteTagMutation,
  useDeleteTaskMutation,
  useRestoreTaskMutation,
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

function tag(id: string, name = `Tag ${id}`): Tag {
  return {
    id,
    userId: 'user-1',
    name,
    color: null,
    createdAt: new Date('2026-09-14T09:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z')
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

describe('useDeleteTagMutation', () => {
  it('убирает тег из списка тегов и со всех задач до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const openKey = queryKeys.tasks('open', '')
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTagMutation())
    queryClient.setQueryData(queryKeys.tags(), [tag('a'), tag('b')])
    queryClient.setQueryData(listKey, [{ ...task('t-1'), tags: [tag('a'), tag('b')] }, task('t-2')])
    queryClient.setQueryData(openKey, [{ ...task('t-1'), tags: [tag('a')] }])

    result.mutate('a')

    await vi.waitFor(() => {
      expect(queryClient.getQueryData<Tag[]>(queryKeys.tags())!.map(el => el.id)).toEqual(['b'])
      expect(queryClient.getQueryData<TaskItem[]>(listKey)![0]!.tags.map(el => el.id)).toEqual(['b'])
      expect(queryClient.getQueryData<TaskItem[]>(openKey)![0]!.tags).toEqual([])
    })
    expect(queryClient.getQueryData<TaskItem[]>(listKey)).toHaveLength(2)

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('удаляет тег запросом DELETE по id', async () => {
    mockApi.mockResolvedValueOnce(tag('a'))
    const { result, wrapper } = withQueryClient(() => useDeleteTagMutation())

    await result.mutateAsync('a')

    expect(mockApi).toHaveBeenCalledWith('/api/tags/a', { method: 'DELETE' })
    wrapper.unmount()
  })

  it('после успеха показывает тост и инвалидирует теги, задачи и шаблоны', async () => {
    mockApi.mockResolvedValueOnce(tag('a'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTagMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('a')

    expect(toastSuccess).toHaveBeenCalledWith('toast.tags.deleteSuccess')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tags'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['templates'] })
    wrapper.unmount()
  })

  it('возвращает тег в список и на задачи при ошибке', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTagMutation())
    queryClient.setQueryData(queryKeys.tags(), [tag('a')])
    queryClient.setQueryData(listKey, [{ ...task('t-1'), tags: [tag('a')] }])

    await expect(result.mutateAsync('a')).rejects.toThrow()

    expect(queryClient.getQueryData<Tag[]>(queryKeys.tags())).toHaveLength(1)
    expect(queryClient.getQueryData<TaskItem[]>(listKey)![0]!.tags).toHaveLength(1)
    expect(toastError).toHaveBeenCalledWith('toast.tags.deleteError')
    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('undo удаления задачи', () => {
  it('после удаления показывает тост с действием «Отменить»', async () => {
    mockApi.mockResolvedValueOnce(task('t-1'))
    const { result, wrapper } = withQueryClient(() => useDeleteTaskMutation())

    await result.mutateAsync('t-1')

    expect(toastSuccess).toHaveBeenCalledWith('toast.tasks.deleteSuccess', {
      label: 'general.undo',
      run: expect.any(Function)
    })
    wrapper.unmount()
  })

  it('«Отменить» восстанавливает именно удалённую задачу', async () => {
    mockApi.mockResolvedValueOnce(task('t-1'))
    const { result, wrapper } = withQueryClient(() => useDeleteTaskMutation())
    await result.mutateAsync('t-1')
    mockApi.mockResolvedValueOnce(task('t-1'))

    toastSuccess.mock.calls[0]![1].run()

    await vi.waitFor(() => expect(mockApi).toHaveBeenLastCalledWith('/api/tasks/t-1/restore', { method: 'POST' }))
    wrapper.unmount()
  })

  it('удаление инвалидирует корзину', async () => {
    mockApi.mockResolvedValueOnce(task('t-1'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteTaskMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('t-1')

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trash'] })
    wrapper.unmount()
  })

  it('при ошибке удаления тоста с «Отменить» нет', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, wrapper } = withQueryClient(() => useDeleteTaskMutation())

    await expect(result.mutateAsync('t-1')).rejects.toThrow()

    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('useRestoreTaskMutation', () => {
  it('восстанавливает задачу, показывает тост и обновляет задачи и корзину', async () => {
    mockApi.mockResolvedValueOnce(task('t-1'))
    const { result, queryClient, wrapper } = withQueryClient(() => useRestoreTaskMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync('t-1')

    expect(mockApi).toHaveBeenCalledWith('/api/tasks/t-1/restore', { method: 'POST' })
    expect(toastSuccess).toHaveBeenCalledWith('toast.tasks.restoreSuccess')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trash'] })
    wrapper.unmount()
  })

  it('обновляет списки, даже если параллельно идёт другая мутация', async () => {
    const pending = deferred<unknown>()
    mockApi.mockImplementation((url: string) => url.endsWith('/restore') ? Promise.resolve(task('t-1')) : pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => ({
      remove: useDeleteTaskMutation(),
      restore: useRestoreTaskMutation()
    }))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    result.remove.mutate('t-2')
    await result.restore.mutateAsync('t-1')

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] })
    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('показывает ошибку, если восстановить не вышло', async () => {
    mockApi.mockRejectedValueOnce(new Error('404'))
    const { result, wrapper } = withQueryClient(() => useRestoreTaskMutation())

    await expect(result.mutateAsync('t-1')).rejects.toThrow()

    expect(toastError).toHaveBeenCalledWith('toast.tasks.restoreError')
    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
