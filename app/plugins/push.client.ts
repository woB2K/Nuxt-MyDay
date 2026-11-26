import { startPush } from '~/composables/usePush'
import { useAuthStore } from '~/stores/auth'
import { browserTimeZone } from '~/utils/push'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const api = useApi()

  watch(() => authStore.accessToken ? authStore.user?.id : undefined, (userId) => {
    if (!userId) return

    startPush(api)

    const timezone = browserTimeZone()
    const settings = authStore.user?.settings

    if (!timezone || !settings || settings.timezone === timezone) return

    api('/api/settings', { method: 'PATCH', body: { timezone } })
      .then((saved) => {
        if (authStore.user) authStore.user.settings = saved as typeof settings
      })
      .catch(() => {})
  }, { immediate: true })
})
