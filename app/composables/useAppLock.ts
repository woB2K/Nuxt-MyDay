import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

export const idleLimit = 5 * 60 * 1000
export const lockRoute = '/auth/pin'

const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const

export function useAppLock() {
  const ui = useUiStore()
  const authStore = useAuthStore()

  let timer: ReturnType<typeof setTimeout> | null = null
  let hiddenAt = 0

  const isLocked = computed(() => ui.isLocked)
  const pinEnabled = computed(() => authStore.user?.settings.pinEnabled ?? false)

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function lock() {
    clearTimer()

    if (pinEnabled.value) ui.isLocked = true
  }

  function schedule() {
    clearTimer()

    if (!pinEnabled.value || ui.isLocked) return

    timer = setTimeout(lock, idleLimit)
  }

  function unlock() {
    ui.isLocked = false
    schedule()
  }

  function prime() {
    if (ui.lockPrimed || !authStore.user) return

    ui.lockPrimed = true

    if (pinEnabled.value) lock()
    else schedule()
  }

  function onActivity() {
    if (ui.isLocked) return

    schedule()
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now()
      clearTimer()
      return
    }

    if (hiddenAt && Date.now() - hiddenAt >= idleLimit) lock()
    else schedule()

    hiddenAt = 0
  }

  function start() {
    activityEvents.forEach(type => document.addEventListener(type, onActivity, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)

    watch(() => authStore.user?.settings, (settings) => {
      if (!settings) return

      if (!ui.lockPrimed) {
        prime()
        return
      }

      if (settings.pinEnabled) schedule()
      else unlock()
    }, { immediate: true, flush: 'sync' })

    watch(() => authStore.isAuthenticated, (authenticated) => {
      if (authenticated) return

      clearTimer()
      ui.isLocked = false
      ui.lockPrimed = false
    })
  }

  return { isLocked, pinEnabled, lock, unlock, schedule, prime, start }
}
