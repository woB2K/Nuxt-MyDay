import { homePath, inviteTokenOf, savePendingInvite } from '~/utils/family'

const publicRoutes = ['/auth/welcome', '/auth/login', '/auth/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) await authStore.init()

  const isPublic = publicRoutes.includes(to.path)

  if (!authStore.isAuthenticated) {
    if (isPublic) return

    const invite = inviteTokenOf(to.path)
    if (invite) savePendingInvite(invite)

    return navigateTo('/auth/welcome')
  }

  if (isPublic) return navigateTo(homePath())
})
