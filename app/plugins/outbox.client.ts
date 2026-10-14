import { useOutbox } from '~/composables/useOutbox'
import { useAuthStore } from '~/stores/auth'
import { OUTBOX_SYNCED } from '~/utils/outbox'

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  const outbox = useOutbox()

  async function reconnect() {
    if (authStore.isOffline) {
      await authStore.init()

      if (!authStore.isAuthenticated) {
        await nuxtApp.runWithContext(() => navigateTo('/auth/welcome'))
        return
      }
    }

    await outbox.flush()
  }

  watch(() => authStore.user?.id, () => {
    outbox.load()
    outbox.flush()
  }, { immediate: true })

  window.addEventListener('online', reconnect)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reconnect()
  })

  navigator.serviceWorker?.addEventListener('message', async (event: MessageEvent<{ type?: string, sent?: number }>) => {
    if (event.data?.type !== OUTBOX_SYNCED) return

    await outbox.load()
    outbox.report(event.data.sent ?? 0)
  })
})
