export const LONG_PRESS_MS = 450

export function useLongPress(onLongPress: () => void, delay = LONG_PRESS_MS) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let fired = false

  function cancel() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function start() {
    fired = false
    cancel()
    timer = setTimeout(() => {
      fired = true
      timer = null
      onLongPress()
    }, delay)
  }

  function guard(event: Event) {
    if (!fired) return

    fired = false
    event.stopPropagation()
    event.preventDefault()
  }

  onBeforeUnmount(cancel)

  return { start, cancel, guard }
}
