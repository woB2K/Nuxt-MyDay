export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return navigateTo('/auth/welcome')
  }
})
