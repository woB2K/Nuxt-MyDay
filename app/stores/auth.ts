import type { UserProfile } from '~~/shared/types'
import { useUiStore } from '~/stores/ui'
import { statusOf } from '~/utils/httpStatus'
import { isOnline } from '~/utils/network'
import { clearOutbox } from '~/utils/outbox'
import { withRefreshLock } from '~/utils/refreshLock'
import { forgetSession, recallSession, rememberSession } from '~/utils/sessionMemory'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => !!accessToken.value || !!user.value)
  const isOffline = computed(() => !!user.value && !accessToken.value)

  watch(user, (profile) => {
    if (profile) rememberSession(profile)
  }, { deep: true })

  function openSession() {
    useUiStore().lockPrimed = true
  }

  let refreshing: Promise<{ accessToken: string }> | null = null

  async function refresh() {
    refreshing ??= withRefreshLock(() => $fetch<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST'
    })).finally(() => {
      refreshing = null
    })

    const { accessToken: newToken } = await refreshing
    accessToken.value = newToken
  }

  function resumeOffline(): boolean {
    const profile = recallSession()

    if (!profile) return false

    user.value = profile
    accessToken.value = null

    return true
  }

  let restoring: Promise<void> | null = null
  let restored = false

  async function restore(): Promise<boolean> {
    if (!isOnline() && resumeOffline()) return false

    try {
      await refresh()
      await fetchUser()

      return true
    } catch (cause) {
      const answered = statusOf(cause) !== undefined

      if (!answered && resumeOffline()) return false

      forget()

      return answered
    }
  }

  let renewing: Promise<void> | null = null

  async function refreshSession() {
    await refresh()

    const subject = tokenSubject(accessToken.value)

    if (user.value && subject && subject !== user.value.id) await fetchUser()
  }

  async function renew(): Promise<boolean> {
    renewing ??= refreshSession().finally(() => {
      renewing = null
    })

    try {
      await renewing

      return true
    } catch (cause) {
      if (statusOf(cause) === undefined) throw cause

      forget()

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
    const userId = user.value?.id

    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
    forget()
    await clearApiCache()
    if (userId) await clearOutbox(userId)
    announceSignOut()
  }

  function forget() {
    user.value = null
    accessToken.value = null
    forgetSession()
  }

  return {
    user,
    accessToken,
    refresh,
    renew,
    init,
    login,
    logout,
    forget,
    register,
    isAuthenticated,
    isOffline
  }
})

if (import.meta.hot) {
  import.meta.hot.accept?.(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
