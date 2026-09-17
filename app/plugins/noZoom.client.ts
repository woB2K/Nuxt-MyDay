const gestureEvents = ['gesturestart', 'gesturechange', 'gestureend'] as const

export default defineNuxtPlugin(() => {
  const block = (event: Event) => event.preventDefault()

  gestureEvents.forEach(type => document.addEventListener(type, block, { passive: false }))
})
