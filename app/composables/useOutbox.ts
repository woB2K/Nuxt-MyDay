import type { QueryClient } from '@tanstack/vue-query'
import type { OutboxEntry } from '~/utils/outbox'
import { useAuthStore } from '~/stores/auth'
import { isOnline } from '~/utils/network'
import { deliver, outboxEntries, putOutboxEntry, removeOutboxEntry, requestBackgroundSync } from '~/utils/outbox'
import { useApi } from './useApi'
import { useAppToast } from './useAppToast'

const pending = ref<OutboxEntry[]>([])

let flushing: Promise<void> | null = null

export function useOutbox() {
  const nuxtApp = useNuxtApp()
  const authStore = useAuthStore()
  const api = useApi()
  const toast = useAppToast()

  async function load() {
    const userId = authStore.user?.id

    pending.value = userId ? await outboxEntries(userId).catch(() => []) : []
  }

  async function enqueue(entry: OutboxEntry) {
    await putOutboxEntry(entry)
    await load()
    void requestBackgroundSync()
  }

  function report(sent: number, rejected = 0) {
    if (!sent && !rejected) return

    const queryClient = nuxtApp.$queryClient as QueryClient
    const { t } = nuxtApp.$i18n

    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['summary'] })

    if (sent) toast.success(t('toast.outbox.sent', sent))
    if (rejected) toast.error(t('toast.outbox.rejected', rejected), { persistent: true })
  }

  async function run() {
    const userId = authStore.user?.id

    if (!userId || !isOnline()) return

    const entries = await outboxEntries(userId)

    if (!entries.length) return

    const { sent, rejected } = await deliver(
      entries,
      entry => api(entry.url, { method: 'POST', body: entry.body }),
      removeOutboxEntry
    )

    await load()
    report(sent.length, rejected.length)
  }

  function flush(): Promise<void> {
    flushing ??= run()
      .catch(() => {})
      .finally(() => {
        flushing = null
      })

    return flushing
  }

  return { pending: computed(() => pending.value), load, enqueue, flush, report }
}
