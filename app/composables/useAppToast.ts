import { useUiStore } from '~/stores/ui'

export const useAppToast = () => {
  const uiStore = useUiStore()

  function error(message: string) {
    uiStore.addToast({
      message,
      type: 'error'
    })
  }

  function success(message: string) {
    uiStore.addToast({
      message,
      type: 'success'
    })
  }

  function info(message: string) {
    uiStore.addToast({
      message,
      type: 'info'
    })
  }

  return {
    error,
    success,
    info
  }
}
