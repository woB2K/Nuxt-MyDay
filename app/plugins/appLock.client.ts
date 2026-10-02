import { lockRoute, useAppLock } from '~/composables/useAppLock'
import { useUiStore } from '~/stores/ui'

export default defineNuxtPlugin(() => {
  const ui = useUiStore()
  const router = useRouter()
  const { isLocked, start } = useAppLock()

  start()

  watch(isLocked, (locked) => {
    if (!locked) return

    const current = router.currentRoute.value.fullPath

    if (current.startsWith(lockRoute)) return

    ui.lockReturn = current

    navigateTo(lockRoute)
  })
})
