import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { useUpdateSettingsMutation } from '../../../app/composables/useSettings'
import { useAuthStore } from '../../../app/stores/auth'

const { mockApi, toastError } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  toastError: vi.fn()
}))

mockNuxtImport('useApi', () => () => mockApi)
mockNuxtImport('useAppToast', () => () => ({ success: () => {}, error: toastError, info: () => {} }))
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

function withQueryClient<T>(composable: () => T) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })

  let result!: T
  const wrapper = mount(
    { setup() {
      result = composable()
      return () => h('div')
    } },
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  )

  return { result, wrapper }
}

const storedSettings = {
  theme: 'dark',
  accent: '#A78BFA',
  lang: 'en',
  pinEnabled: false,
  pinHash: null
}

function seedUser() {
  const authStore = useAuthStore()
  authStore.user = { id: 'user-1', name: 'John', email: 'john@example.com', settings: { ...storedSettings } }

  return authStore
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockApi.mockReset()
  toastError.mockReset()
})

describe('useUpdateSettingsMutation', () => {
  it('шлёт только изменённое поле в PATCH /api/settings', async () => {
    mockApi.mockResolvedValueOnce({ ...storedSettings, theme: 'light' })
    seedUser()
    const { result, wrapper } = withQueryClient(() => useUpdateSettingsMutation())

    await result.mutateAsync({ theme: 'light' })

    expect(mockApi).toHaveBeenCalledWith('/api/settings', { method: 'PATCH', body: { theme: 'light' } })
    wrapper.unmount()
  })

  it('кладёт ответ сервера в профиль, а не то, что отправили', async () => {
    mockApi.mockResolvedValueOnce({ ...storedSettings, accent: 'teal' })
    const authStore = seedUser()
    const { result, wrapper } = withQueryClient(() => useUpdateSettingsMutation())

    await result.mutateAsync({ accent: 'teal' })

    expect(authStore.user!.settings.accent).toBe('teal')
    wrapper.unmount()
  })

  it('показывает тост и оставляет профиль нетронутым, если сервер отказал', async () => {
    mockApi.mockRejectedValueOnce(new Error('500'))
    const authStore = seedUser()
    const { result, wrapper } = withQueryClient(() => useUpdateSettingsMutation())

    await expect(result.mutateAsync({ lang: 'ru' })).rejects.toThrow()

    expect(authStore.user!.settings.lang).toBe('en')
    expect(toastError).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
