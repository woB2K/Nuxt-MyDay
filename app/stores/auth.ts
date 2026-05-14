import type { UserProfile } from '~~/shared/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => !!accessToken.value)

  async function refresh() {
    const { accessToken: newToken } = await $fetch<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST'
    })
    accessToken.value = newToken
  }

  async function init() {
    try {
      await refresh()
      await fetchUser()
    } catch {
      user.value = null
      accessToken.value = null
    }
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
    user.value = userData
    accessToken.value = token
  }

  async function login(body: LoginInput) {
    const { user: userData, accessToken: token } = await $fetch<{ user: UserProfile, accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body
    })
    user.value = userData
    accessToken.value = token
  }

  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
    user.value = null
    accessToken.value = null
  }

  return {
    user,
    accessToken,
    refresh,
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
