import type { TrashResponse } from '../../../shared/types'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { queryKeys } from '../../../app/composables/queryKeys'
import { useRestoreSavingsMutation, useRestoreTransactionMutation } from '../../../app/composables/useFinance'
import { useRestoreTaskMutation } from '../../../app/composables/useTasks'
import { useDeleteForeverMutation, useEmptyTrashMutation, useTrashQuery } from '../../../app/composables/useTrash'

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
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function trash(): TrashResponse {
  return {
    tasks: [{ id: 't-1' }, { id: 't-2' }],
    transactions: [{ id: 'tx-1' }],
    savings: [{ id: 's-1' }]
  } as unknown as TrashResponse
}

const key = queryKeys.trash()

beforeEach(() => {
  mockApi.mockReset()
  toastSuccess.mockReset()
  toastError.mockReset()
})

describe('useTrashQuery', () => {
  it('читает корзину с сервера', async () => {
    mockApi.mockResolvedValueOnce(trash())
    const { result, wrapper } = withQueryClient(() => useTrashQuery())

    await vi.waitFor(() => expect(result.data.value?.tasks).toHaveLength(2))

    expect(mockApi).toHaveBeenCalledWith('/api/trash')
    wrapper.unmount()
  })
})

describe('useDeleteForeverMutation', () => {
  it('убирает объект из корзины до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteForeverMutation())
    queryClient.setQueryData(key, trash())

    result.mutate({ kind: 'task', id: 't-1' })

    await vi.waitFor(() => expect(queryClient.getQueryData<TrashResponse>(key)!.tasks.map(el => el.id)).toEqual(['t-2']))
    expect(mockApi).toHaveBeenCalledWith('/api/trash/task/t-1', { method: 'DELETE' })

    pending.resolve(undefined)
    wrapper.unmount()
  })

  it('после успеха показывает тост и перечитывает корзину', async () => {
    mockApi.mockResolvedValueOnce({ deleted: 1 })
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteForeverMutation())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync({ kind: 'savings', id: 's-1' })

    expect(mockApi).toHaveBeenCalledWith('/api/trash/savings/s-1', { method: 'DELETE' })
    expect(toastSuccess).toHaveBeenCalledWith('toast.trash.deleteSuccess')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['trash'] })
    wrapper.unmount()
  })

  it('возвращает объект в корзину при ошибке', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useDeleteForeverMutation())
    queryClient.setQueryData(key, trash())

    await expect(result.mutateAsync({ kind: 'transaction', id: 'tx-1' })).rejects.toThrow()

    expect(queryClient.getQueryData<TrashResponse>(key)!.transactions).toHaveLength(1)
    expect(toastError).toHaveBeenCalledWith('toast.trash.deleteError')
    expect(toastSuccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('useEmptyTrashMutation', () => {
  it('очищает корзину в кэше до ответа сервера', async () => {
    const pending = deferred<unknown>()
    mockApi.mockReturnValueOnce(pending.promise)
    const { result, queryClient, wrapper } = withQueryClient(() => useEmptyTrashMutation())
    queryClient.setQueryData(key, trash())

    result.mutate()

    await vi.waitFor(() => expect(queryClient.getQueryData(key)).toEqual({ tasks: [], transactions: [], savings: [] }))
    expect(mockApi).toHaveBeenCalledWith('/api/trash', { method: 'DELETE' })

    pending.resolve({ deleted: 4 })
    wrapper.unmount()
  })

  it('после успеха показывает тост', async () => {
    mockApi.mockResolvedValueOnce({ deleted: 4 })
    const { result, wrapper } = withQueryClient(() => useEmptyTrashMutation())

    await result.mutateAsync()

    expect(toastSuccess).toHaveBeenCalledWith('toast.trash.emptySuccess')
    wrapper.unmount()
  })

  it('возвращает содержимое корзины при ошибке', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const { result, queryClient, wrapper } = withQueryClient(() => useEmptyTrashMutation())
    queryClient.setQueryData(key, trash())

    await expect(result.mutateAsync()).rejects.toThrow()

    expect(queryClient.getQueryData(key)).toEqual(trash())
    expect(toastError).toHaveBeenCalledWith('toast.trash.emptyError')
    wrapper.unmount()
  })
})

describe('восстановление убирает объект из корзины сразу', () => {
  const cases = [
    { name: 'задача', hook: useRestoreTaskMutation, id: 't-1', list: 'tasks', left: ['t-2'] },
    { name: 'транзакция', hook: useRestoreTransactionMutation, id: 'tx-1', list: 'transactions', left: [] },
    { name: 'запись копилки', hook: useRestoreSavingsMutation, id: 's-1', list: 'savings', left: [] }
  ] as const

  for (const { name, hook, id, list, left } of cases) {
    it(`${name}: пропадает из корзины до ответа сервера`, async () => {
      const pending = deferred<unknown>()
      mockApi.mockReturnValueOnce(pending.promise)
      const { result, queryClient, wrapper } = withQueryClient(() => hook())
      queryClient.setQueryData(key, trash())

      result.mutate(id)

      await vi.waitFor(() => expect(queryClient.getQueryData<TrashResponse>(key)![list].map(el => el.id)).toEqual(left))

      pending.resolve(undefined)
      wrapper.unmount()
    })

    it(`${name}: возвращается в корзину, если сервер отказал`, async () => {
      mockApi.mockRejectedValueOnce(new Error('500'))
      const { result, queryClient, wrapper } = withQueryClient(() => hook())
      queryClient.setQueryData(key, trash())

      await expect(result.mutateAsync(id)).rejects.toThrow()

      expect(queryClient.getQueryData(key)).toEqual(trash())
      wrapper.unmount()
    })
  }

  it('без закэшированной корзины (undo из тоста) ничего в кэш не пишет', async () => {
    mockApi.mockResolvedValueOnce(undefined)
    const { result, queryClient, wrapper } = withQueryClient(() => useRestoreTaskMutation())

    await result.mutateAsync('t-1')

    expect(queryClient.getQueryData(key)).toBeUndefined()
    wrapper.unmount()
  })
})
