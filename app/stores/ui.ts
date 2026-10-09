import type { AccentName } from '~/utils/accents'
import { defaultAccent } from '~/utils/accents'

type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  run: () => void
}

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: ToastAction
}

const TOAST_DURATION = 3000
const ACTION_TOAST_DURATION = 5000

export const useUiStore = defineStore('ui', () => {
  const queue = ref<Toast[]>([])
  const accent = ref<AccentName>(defaultAccent)
  const isLocked = ref(false)
  const lockPrimed = ref(false)
  const lockReturn = ref('/today')

  let toastSeq = 0

  function addToast(toast: Omit<Toast, 'id'>) {
    toastSeq += 1

    queue.value.push({
      duration: toast.action ? ACTION_TOAST_DURATION : TOAST_DURATION,
      ...toast,
      id: `toast-${toastSeq}`
    })
  }

  function removeToast(id: string) {
    queue.value = queue.value.filter(toast => toast.id !== id)
  }

  return {
    queue,
    accent,
    isLocked,
    lockPrimed,
    lockReturn,
    addToast,
    removeToast
  }
})

if (import.meta.hot) {
  import.meta.hot.accept?.(acceptHMRUpdate(useUiStore, import.meta.hot))
}
