import type { UserProfile } from '~~/shared/types'
import { useUiStore } from '~/stores/ui'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => !!accessToken.value)

  function openSession() {
    useUiStore().lockPrimed = true
  }

  async function refresh() {
    const { accessToken: newToken } = await $fetch<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST'
    })
    accessToken.value = newToken
  }

  let restoring: Promise<void> | null = null
  let restored = false

  async function restore(): Promise<boolean> {
    try {
      await refresh()
      await fetchUser()

      return true
    } catch (cause) {
      user.value = null
      accessToken.value = null

      return typeof (cause as { statusCode?: number }).statusCode === 'number'
    }
  }

  let renewing: Promise<void> | null = null

  async function renew(): Promise<boolean> {
    renewing ??= refresh().finally(() => {
      renewing = null
    })

    try {
      await renewing

      return true
    } catch {
      user.value = null
      accessToken.value = null

      return false
    }
  }

  async function init() {
    if (accessToken.value || restored) return

    restoring ??= restore()
      .then((settled) => {
        restored = settled
      })
      .finally(() => {
        restoring = null
      })

    await restoring
  }

  async function fetchUser() {
    try {
      const profile = await $fetch<UserProfile>('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      user.value = profile
    } catch {
      user.value = null
    }
  }

  async function register(body: RegisterInput) {
    const { user: userData, accessToken: token } = await $fetch<{ user: UserProfile, accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body
    })
    openSession()
    user.value = userData
    accessToken.value = token
  }

  async function login(body: LoginInput) {
    const { user: userData, accessToken: token } = await $fetch<{ user: UserProfile, accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body
    })
    openSession()
    user.value = userData
    accessToken.value = token
  }

  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
    user.value = null
    accessToken.value = null
    await clearApiCache()
  }

  return {
    user,
    accessToken,
    refresh,
    renew,
    init,
    login,
    logout,
    register,
    isAuthenticated
  }
})

if (import.meta.hot) {
  import.meta.hot.accept?.(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
