const PUSH_ICON = '/pwa-192x192.png'

globalThis.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'MyDay'

  event.waitUntil(globalThis.registration.showNotification(title, {
    body: payload.body || '',
    icon: PUSH_ICON,
    badge: PUSH_ICON,
    tag: payload.tag,
    data: { url: payload.url || '/today' }
  }))
})

globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = new URL(event.notification.data?.url || '/today', globalThis.location.origin)

  event.waitUntil((async () => {
    const windows = await globalThis.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const client = windows.find(item => new URL(item.url).origin === target.origin)

    if (client) {
      await client.focus()
      if ('navigate' in client) await client.navigate(target.href)
      return
    }

    await globalThis.clients.openWindow(target.href)
  })())
})
