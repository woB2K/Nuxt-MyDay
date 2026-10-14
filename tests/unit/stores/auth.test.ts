import { Buffer } from 'node:buffer'
import { IDBFactory } from 'fake-indexeddb'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useAuthStore } from '../../../app/stores/auth'
import { AUTH_CHANNEL, SIGNED_OUT } from '../../../app/utils/authChannel'
import { outboxEntries, putOutboxEntry, transactionEntry } from '../../../app/utils/outbox'
import { REFRESH_LOCK } from '../../../app/utils/refreshLock'
import { recallSession, rememberSession } from '../../../app/utils/sessionMemory'
import 'fake-indexeddb/auto'

const mockFetch = vi.fn()

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.stubGlobal('$fetch', mockFetch)
  vi.stubGlobal('indexedDB', new IDBFactory())
})

afterEach(() => {
  mockFetch.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const jwt = (sub: string) => `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`
const networkDown = () => Object.assign(new Error('fetch failed'), { name: 'FetchError' })
const unauthorized = () => Object.assign(new Error('Unauthorized'), { statusCode: 401 })
const refreshCalls = () => mockFetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')

const mockUser = {
  id: 'user-1',
  name: 'John',
  email: 'john@example.com',
  settings: {
    theme: 'dark',
    accent: 'blue',
    lang: 'en',
    pinEnabled: false
  }
}

describe('init()', () => {
  it('sets accessToken and user when refresh cookie is valid', async () => {
    mockFetch
      .mockResolvedValueOnce({ accessToken: 'new-access-token' }) // POST /api/auth/refresh
      .mockResolvedValueOnce(mockUser) // GET /api/users/me

    const store = useAuthStore()
    await store.init()

    expect(store.accessToken).toBe('new-access-token')
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('skips a second restore once the session is already there', async () => {
    mockFetch
      .mockResolvedValueOnce({ accessToken: 'new-access-token' })
      .mockResolvedValueOnce(mockUser)

    const store = useAuthStore()
    await store.init()
    await store.init()

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('shares one refresh between concurrent callers, since the endpoint rotates the token', async () => {
    mockFetch
      .mockResolvedValueOnce({ accessToken: 'new-access-token' })
      .mockResolvedValueOnce(mockUser)

    const store = useAuthStore()
    await Promise.all([store.init(), store.init()])

    const refreshCalls = mockFetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')
    expect(refreshCalls).toHaveLength(1)
  })

  it('leaves the session empty when refresh fails (cookie expired or missing)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

    const store = useAuthStore()

    await store.init()

    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('retries after a transport failure — the network may just have been down', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'))
    const store = useAuthStore()
    await store.init()

    mockFetch
      .mockResolvedValueOnce({ accessToken: 'new-access-token' })
      .mockResolvedValueOnce(mockUser)
    await store.init()

    expect(store.isAuthenticated).toBe(true)
  })

  it('не переспрашивает сервер, если он уже ответил «сессии нет»', async () => {
    mockFetch.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { statusCode: 401 }))

    const store = useAuthStore()
    await store.init()
    await store.init()
    await store.init()

    const refreshCalls = mockFetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')
    expect(refreshCalls).toHaveLength(1)
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('renew()', () => {
  it('перечитывает профиль, если в другой вкладке вошли под другим аккаунтом', async () => {
    const other = { ...mockUser, id: 'user-2', name: 'Masha' }
    mockFetch
      .mockResolvedValueOnce({ accessToken: jwt('user-2') })
      .mockResolvedValueOnce(other)

    const store = useAuthStore()
    store.user = mockUser
    store.accessToken = 'old-token'

    await expect(store.renew()).resolves.toBe(true)
    expect(store.user).toEqual(other)
  })

  it('не трогает профиль, если токен того же пользователя', async () => {
    mockFetch.mockResolvedValueOnce({ accessToken: jwt('user-1') })

    const store = useAuthStore()
    store.user = mockUser
    store.accessToken = 'old-token'

    await store.renew()

    expect(store.user).toEqual(mockUser)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('logout()', () => {
  it('сообщает другим вкладкам, что сессия закончилась', async () => {
    const listener = new BroadcastChannel(AUTH_CHANNEL)
    const message = new Promise(resolve => listener.addEventListener('message', event => resolve(event.data), { once: true }))
    mockFetch.mockResolvedValueOnce({})

    await useAuthStore().logout()

    await expect(message).resolves.toBe(SIGNED_OUT)
    listener.close()
  })

  it('clears accessToken and user after successful logout', async () => {
    mockFetch.mockResolvedValueOnce({}) // POST /api/auth/logout

    const store = useAuthStore()
    store.accessToken = 'some-token'
    store.user = mockUser

    await store.logout()

    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('purges cached api responses so the next account cannot read them', async () => {
    const remove = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('caches', { delete: remove })
    mockFetch.mockResolvedValueOnce({})

    const store = useAuthStore()
    store.accessToken = 'some-token'
    store.user = mockUser

    await store.logout()

    expect(remove).toHaveBeenCalledWith('myday-api')
  })

  it('sends logout request to the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({})

    const store = useAuthStore()
    await store.logout()

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })
})

describe('офлайн-сессия', () => {
  it('открывает запомненный профиль, если сеть упала на старте', async () => {
    rememberSession(mockUser)
    mockFetch.mockRejectedValueOnce(networkDown())

    const store = useAuthStore()
    await store.init()

    expect(store.user).toEqual(mockUser)
    expect(store.accessToken).toBeNull()
    expect(store.isAuthenticated).toBe(true)
    expect(store.isOffline).toBe(true)
  })

  it('не ходит за refresh, когда браузер уже знает, что сети нет', async () => {
    rememberSession(mockUser)
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    const store = useAuthStore()
    await store.init()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(store.isOffline).toBe(true)
  })

  it('без запомненного профиля офлайн-старт оставляет анонимом', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    mockFetch.mockRejectedValueOnce(networkDown())

    const store = useAuthStore()
    await store.init()

    expect(store.isAuthenticated).toBe(false)
  })

  it('переходит в обычную сессию, когда сеть вернулась', async () => {
    rememberSession(mockUser)
    mockFetch.mockRejectedValueOnce(networkDown())

    const store = useAuthStore()
    await store.init()

    mockFetch
      .mockResolvedValueOnce({ accessToken: 'fresh-token' })
      .mockResolvedValueOnce(mockUser)
    await store.init()

    expect(store.accessToken).toBe('fresh-token')
    expect(store.isOffline).toBe(false)
  })

  it('забывает профиль, когда сервер ответил «сессии нет»', async () => {
    rememberSession(mockUser)
    mockFetch.mockRejectedValueOnce(unauthorized())

    const store = useAuthStore()
    await store.init()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(recallSession()).toBeNull()
  })

  it('запоминает профиль после входа и обновляет его вместе с настройками', async () => {
    mockFetch.mockResolvedValueOnce({ user: mockUser, accessToken: 'token' })

    const store = useAuthStore()
    await store.login({ email: 'john@example.com', password: 'password123' })
    await nextTick()

    expect(recallSession()).toEqual(mockUser)

    store.user!.settings.pinEnabled = true
    await nextTick()

    expect(recallSession()?.settings.pinEnabled).toBe(true)
  })

  it('стирает запомненный профиль при выходе и при forget()', async () => {
    mockFetch.mockResolvedValueOnce({})

    const store = useAuthStore()
    store.accessToken = 'token'
    store.user = mockUser
    await nextTick()

    await store.logout()

    expect(recallSession()).toBeNull()

    store.user = mockUser
    await nextTick()
    store.forget()

    expect(recallSession()).toBeNull()
  })
})

describe('refresh', () => {
  it('init() и renew() делят один запрос — второй refresh убил бы ротированный токен', async () => {
    mockFetch
      .mockResolvedValueOnce({ accessToken: jwt('user-1') })
      .mockResolvedValueOnce(mockUser)

    const store = useAuthStore()
    store.user = mockUser

    await Promise.all([store.init(), store.renew()])

    expect(refreshCalls()).toHaveLength(1)
    expect(store.accessToken).toBe(jwt('user-1'))
  })

  it('идёт под Web Lock, чтобы не столкнуться с другой вкладкой и service worker', async () => {
    const request = vi.fn((_name: string, run: () => Promise<unknown>) => run())
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true })
    mockFetch
      .mockResolvedValueOnce({ accessToken: 'token' })
      .mockResolvedValueOnce(mockUser)

    try {
      await useAuthStore().init()

      expect(request).toHaveBeenCalledWith(REFRESH_LOCK, expect.any(Function))
    } finally {
      Reflect.deleteProperty(navigator, 'locks')
    }
  })

  it('renew() на обрыве сети бросает ошибку и не выкидывает из сессии', async () => {
    mockFetch.mockRejectedValueOnce(networkDown())

    const store = useAuthStore()
    store.user = mockUser
    store.accessToken = 'old-token'
    await nextTick()

    await expect(store.renew()).rejects.toThrow('fetch failed')
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
    expect(recallSession()).toEqual(mockUser)
  })

  it('renew() на ответе сервера 401 чистит сессию и память о ней', async () => {
    mockFetch.mockRejectedValueOnce(unauthorized())

    const store = useAuthStore()
    store.user = mockUser
    store.accessToken = 'old-token'
    await nextTick()

    await expect(store.renew()).resolves.toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(recallSession()).toBeNull()
  })
})

describe('logout() и очередь офлайн-записей', () => {
  it('удаляет неотправленные записи только вышедшего пользователя', async () => {
    const body = { type: 'EXPENSE' as const, amount: 100, categoryId: 'cat-1', date: '2026-10-14' }
    await putOutboxEntry(transactionEntry('user-1', { ...body, id: 'a'.repeat(32) }))
    await putOutboxEntry(transactionEntry('user-2', { ...body, id: 'b'.repeat(32) }))
    mockFetch.mockResolvedValueOnce({})

    const store = useAuthStore()
    store.accessToken = 'token'
    store.user = mockUser

    await store.logout()

    expect(await outboxEntries('user-1')).toEqual([])
    expect(await outboxEntries('user-2')).toHaveLength(1)
  })
})
