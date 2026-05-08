export const useAuthStore = defineStore('auth', () => {
  async function init() {
    // TODO: implement
  }

  return {
    init
  }
})

if (import.meta.hot) {
  import.meta.hot.accept?.(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
