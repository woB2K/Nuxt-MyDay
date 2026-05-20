type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export const useUiStore = defineStore('ui', () => {
  const queue = ref<Toast[]>([])

  function addToast(toast: Omit<Toast, 'id'>) {
    queue.value.push({
      duration: 3000,
      ...toast,
      id: crypto.randomUUID()
    })
  }

  function removeToast(id: string) {
    queue.value = queue.value.filter(toast => toast.id !== id)
  }

  return {
    queue,
    addToast,
    removeToast
  }
})

if (import.meta.hot) {
  import.meta.hot.accept?.(acceptHMRUpdate(useUiStore, import.meta.hot))
}
