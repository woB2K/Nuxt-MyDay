import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../../app/stores/auth'

const mockFetch = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('$fetch', mockFetch)
})

afterEach(() => {
  mockFetch.mockReset()
  vi.unstubAllGlobals()
})

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

  it('recovers after a failed restore instead of latching the first outcome', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))
    const store = useAuthStore()
    await store.init()

    mockFetch
      .mockResolvedValueOnce({ accessToken: 'new-access-token' })
      .mockResolvedValueOnce(mockUser)
    await store.init()

    expect(store.isAuthenticated).toBe(true)
  })
})

describe('logout()', () => {
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
