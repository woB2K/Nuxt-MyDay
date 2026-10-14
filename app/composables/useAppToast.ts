import type { ToastAction } from '~/stores/ui'
import { useUiStore } from '~/stores/ui'

export const useAppToast = () => {
  const uiStore = useUiStore()

  function error(message: string) {
    uiStore.addToast({
      message,
      type: 'error'
    })
  }

  function success(message: string, action?: ToastAction) {
    uiStore.addToast({
      message,
      type: 'success',
      action
    })
  }

  function info(message: string, options: { persistent?: boolean } = {}) {
    uiStore.addToast({
      message,
      type: 'info',
      ...(options.persistent && { duration: 0 })
    })
  }

  return {
    error,
    success,
    info
  }
}
