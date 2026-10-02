export function useKeyboardInset() {
  const inset = ref(0)

  function read() {
    const viewport = window.visualViewport

    if (!viewport) return

    inset.value = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
  }

  function start() {
    const viewport = window.visualViewport

    if (!viewport) return

    read()
    viewport.addEventListener('resize', read)
    viewport.addEventListener('scroll', read)
  }

  function stop() {
    const viewport = window.visualViewport

    inset.value = 0

    if (!viewport) return

    viewport.removeEventListener('resize', read)
    viewport.removeEventListener('scroll', read)
  }

  onMounted(start)
  onUnmounted(stop)

  return { inset, start, stop }
}
