export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    await authStore.init()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/welcome')
  }
})
