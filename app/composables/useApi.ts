export function useApi() {
  const authStore = useAuthStore()

  return $fetch.create({
    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    }
  })
}
