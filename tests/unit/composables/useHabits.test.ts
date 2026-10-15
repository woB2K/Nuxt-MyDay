import type { HabitItem } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { queryKeys } from '../../../app/composables/queryKeys'
import {
  useDeleteHabitMutation,
  useHabitsQuery,
  useReorderHabitsMutation,
  useToggleHabitMarkMutation
} from '../../../app/composables/useHabits'

const { mockApi, toastSuccess, toastError } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useApi', () => () => mockApi)
mockNuxtImport('useAppToast', () => () => ({ success: toastSuccess, error: toastError, info: () => {} }))
mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => params ? `${key}(${JSON.stringify(params)})` : key
}))

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
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function habit(id: string, marks: string[] = []): HabitItem {
  return { id, name: id, icon: 'leaf', color: 'green', perWeek: null, sortOrder: 0, marks } as unknown as HabitItem
}

const key = queryKeys.habits()
const cached = (queryClient: QueryClient) => queryClient.getQueryData<HabitItem[]>(key)!

beforeEach(() => {
  mockApi.mockReset()
  toastSuccess.mockReset()
  toastError.mockReset()
})

describe('useHabitsQuery', () => {
  it('читает привычки с сервера', async () => {
    mockApi.mockResolvedValueOnce([habit('h-1')])
    const { result, wrapper } = withQueryClient(() => useHabitsQuery())

    await vi.waitFor(() => expect(result.data.value).toHaveLength(1))

    expect(mockApi).toHaveBeenCalledWith('/api/habits')
    wrapper.unmount()
  })
})

describe('useToggleHabitMarkMutation', () => {
  it('отмечает день до ответа сервера и шлёт PUT с «сегодня» клиента', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleHabitMarkMutation())
    queryClient.setQueryData(key, [habit('h-1', ['2026-10-14']), habit('h-2')])

    result.mutate({ id: 'h-1', date: '2026-10-15', marked: true })

    await vi.waitFor(() => expect(cached(queryClient)[0]!.marks).toEqual(['2026-10-14', '2026-10-15']))
    expect(cached(queryClient)[1]!.marks).toEqual([])
    expect(mockApi).toHaveBeenCalledWith('/api/habits/h-1/marks/2026-10-15', {
      method: 'PUT',
      query: { today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }
    })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('быстрый повторный тап уходит на сервер только после первого запроса', async () => {
    const first = deferred<unknown>()
    mockApi.mockReturnValueOnce(first.promise).mockResolvedValueOnce(habit('h-1'))
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleHabitMarkMutation())
    queryClient.setQueryData(key, [habit('h-1')])

    result.mutate({ id: 'h-1', date: '2026-10-15', marked: true })
    result.mutate({ id: 'h-1', date: '2026-10-15', marked: false })

    await vi.waitFor(() => expect(mockApi).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(cached(queryClient)[0]!.marks).toEqual([]))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(mockApi).toHaveBeenCalledTimes(1)

    first.resolve(undefined)

    await vi.waitFor(() => expect(mockApi).toHaveBeenCalledTimes(2))
    expect(mockApi.mock.calls[1]![1]).toMatchObject({ method: 'DELETE' })
    wrapper.unmount()
  })

  it('снятие отметки — DELETE', async () => {
    mockApi.mockResolvedValueOnce(habit('h-1'))
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleHabitMarkMutation())
    queryClient.setQueryData(key, [habit('h-1', ['2026-10-15'])])

    await result.mutateAsync({ id: 'h-1', date: '2026-10-15', marked: false })

    expect(mockApi.mock.calls[0]![1]).toMatchObject({ method: 'DELETE' })
    wrapper.unmount()
  })

  it('при ошибке возвращает отметки и показывает тост', async () => {
    mockApi.mockRejectedValueOnce(new Error('400'))
    const { result, queryClient, wrapper } = withQueryClient(() => useToggleHabitMarkMutation())
    queryClient.setQueryData(key, [habit('h-1')])

    await expect(result.mutateAsync({ id: 'h-1', date: '2026-10-15', marked: true })).rejects.toThrow()

    expect(cached(queryClient)[0]!.marks).toEqual([])
    expect(toastError).toHaveBeenCalledWith('toast.habits.markError')
    wrapper.unmount()
  })
})

describe('useReorderHabitsMutation', () => {
  it('переставляет привычки в кэше сразу', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useReorderHabitsMutation())
    queryClient.setQueryData(key, [habit('a'), habit('b'), habit('c')])

    result.mutate(['b', 'a', 'c'])

    await vi.waitFor(() => expect(cached(queryClient).map(el => el.id)).toEqual(['b', 'a', 'c']))
    expect(mockApi).toHaveBeenCalledWith('/api/habits/order', { method: 'PUT', body: { ids: ['b', 'a', 'c'] } })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('при ошибке возвращает прежний порядок', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useReorderHabitsMutation())
    queryClient.setQueryData(key, [habit('a'), habit('b')])

    await expect(result.mutateAsync(['b', 'a'])).rejects.toThrow()

    expect(cached(queryClient).map(el => el.id)).toEqual(['a', 'b'])
    expect(toastError).toHaveBeenCalledWith('toast.habits.reorderError')
    wrapper.unmount()
  })
})

describe('useDeleteHabitMutation', () => {
  it('убирает привычку из списка до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteHabitMutation())
    queryClient.setQueryData(key, [habit('h-1'), habit('h-2')])

    result.mutate({ id: 'h-1', name: 'Медитация' })

    await vi.waitFor(() => expect(cached(queryClient).map(el => el.id)).toEqual(['h-2']))

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('тост называет привычку, «Отменить» восстанавливает её', async () => {
    mockApi.mockResolvedValueOnce(habit('h-1'))
    const { result, wrapper } = withQueryClient(() => useDeleteHabitMutation())
    await result.mutateAsync({ id: 'h-1', name: 'Медитация' })
    mockApi.mockResolvedValueOnce(habit('h-1'))

    expect(toastSuccess).toHaveBeenCalledWith('toast.habits.deleted({"name":"Медитация"})', {
      label: 'general.undo',
      run: expect.any(Function)
    })
    toastSuccess.mock.calls[0]![1].run()

    await vi.waitFor(() => expect(mockApi).toHaveBeenLastCalledWith('/api/habits/h-1/restore', { method: 'POST' }))
    wrapper.unmount()
  })

  it('при ошибке возвращает привычку в список', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteHabitMutation())
    queryClient.setQueryData(key, [habit('h-1')])

    await expect(result.mutateAsync({ id: 'h-1', name: 'Медитация' })).rejects.toThrow()

    expect(cached(queryClient).map(el => el.id)).toEqual(['h-1'])
    expect(toastError).toHaveBeenCalledWith('toast.habits.deleteError')
    wrapper.unmount()
  })
})
