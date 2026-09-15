const publicRoutes = ['/auth/welcome', '/auth/login', '/auth/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) await authStore.init()

  const isPublic = publicRoutes.includes(to.path)

  if (!authStore.isAuthenticated) {
    return isPublic ? undefined : navigateTo('/auth/welcome')
  }

  if (isPublic) return navigateTo('/today')
})
