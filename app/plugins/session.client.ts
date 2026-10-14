import type { QueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '~/stores/auth'
import { useFinanceStore } from '~/stores/finance'
import { useTasksStore } from '~/stores/tasks'
import { clearApiCache } from '~/utils/swCache'

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  const finance = useFinanceStore()
  const tasks = useTasksStore()

  watch(() => authStore.user?.id, (_id, previous) => {
    if (!previous) return

    const queryClient = nuxtApp.$queryClient as QueryClient

    queryClient.clear()
    finance.resetFilters()
    tasks.resetFilters()
    clearApiCache()
  })
})
