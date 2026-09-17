import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useApi } from '../../../app/composables/useApi'

const { store, navigate } = vi.hoisted(() => ({
  store: { accessToken: 'stale-token' as string | null, renew: vi.fn() },
  navigate: vi.fn()
}))

mockNuxtImport('useAuthStore', () => () => store)
mockNuxtImport('navigateTo', () => navigate)

function unauthorized() {
  return Object.assign(new Error('Unauthorized'), { statusCode: 401 })
}

let client: ReturnType<typeof vi.fn>

beforeEach(() => {
  client = vi.fn()
  store.accessToken = 'stale-token'
  store.renew = vi.fn().mockResolvedValue(true)
  navigate.mockClear()

  vi.stubGlobal('$fetch', Object.assign(vi.fn(), { create: () => client }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useApi', () => {
  it('отдаёт ответ как есть, когда токен ещё живой', async () => {
    client.mockResolvedValueOnce({ id: 'task-1' })

    expect(await useApi()('/api/tasks')).toEqual({ id: 'task-1' })
    expect(store.renew).not.toHaveBeenCalled()
  })

  it('на 401 обновляет токен и повторяет запрос', async () => {
    client.mockRejectedValueOnce(unauthorized()).mockResolvedValueOnce({ id: 'task-1' })

    const result = await useApi()('/api/tasks', { method: 'POST', body: { title: 'x' } })

    expect(result).toEqual({ id: 'task-1' })
    expect(store.renew).toHaveBeenCalledTimes(1)
    expect(client).toHaveBeenCalledTimes(2)
    expect(client.mock.calls[1]?.[1]).toMatchObject({ method: 'POST', body: { title: 'x' } })
  })

  it('повторяет ровно один раз — второй 401 уже отдаёт наверх', async () => {
    client.mockRejectedValue(unauthorized())

    await expect(useApi()('/api/tasks')).rejects.toThrow('Unauthorized')
    expect(client).toHaveBeenCalledTimes(2)
  })

  it('уводит на welcome, когда refresh-кука тоже мертва', async () => {
    client.mockRejectedValueOnce(unauthorized())
    store.renew = vi.fn().mockResolvedValue(false)

    await expect(useApi()('/api/tasks')).rejects.toThrow('Unauthorized')
    expect(navigate).toHaveBeenCalledWith('/auth/welcome')
    expect(client).toHaveBeenCalledTimes(1)
  })

  it('не трогает refresh на других ошибках', async () => {
    client.mockRejectedValueOnce(Object.assign(new Error('Bad request'), { statusCode: 400 }))

    await expect(useApi()('/api/tasks')).rejects.toThrow('Bad request')
    expect(store.renew).not.toHaveBeenCalled()
    expect(client).toHaveBeenCalledTimes(1)
  })
})
