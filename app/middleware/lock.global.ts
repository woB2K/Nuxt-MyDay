import { lockRoute, useAppLock } from '~/composables/useAppLock'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const ui = useUiStore()
  const { prime } = useAppLock()

  if (!authStore.isAuthenticated) await authStore.init()

  prime()

  if (!ui.isLocked || to.path === lockRoute) return

  ui.lockReturn = to.fullPath

  return navigateTo(lockRoute)
})
