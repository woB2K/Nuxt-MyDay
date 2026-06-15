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
    pinEnabled: false,
    pinHash: null
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

  it('clears state when refresh fails (cookie expired or missing)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

    const store = useAuthStore()
    // Simulate a stale state from a previous session
    store.accessToken = 'stale-token'

    await store.init()

    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
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

  it('sends logout request to the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({})

    const store = useAuthStore()
    await store.logout()

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })
})
