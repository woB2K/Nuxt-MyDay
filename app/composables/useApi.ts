import type { FetchOptions } from 'ofetch'

function statusOf(error: unknown): number | undefined {
  return (error as { statusCode?: number, status?: number })?.statusCode
    ?? (error as { status?: number })?.status
}

export function useApi() {
  const authStore = useAuthStore()

  const client = $fetch.create({
    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    }
  })

  return async function api<T>(request: string, options?: FetchOptions): Promise<T> {
    try {
      return await client<T>(request, options as FetchOptions<'json'>)
    } catch (error) {
      if (statusOf(error) !== 401) throw error

      if (!await authStore.renew()) {
        await navigateTo('/auth/welcome')
        throw error
      }

      return await client<T>(request, options as FetchOptions<'json'>)
    }
  }
}
