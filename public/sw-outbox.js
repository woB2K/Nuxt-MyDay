const OUTBOX_DB = 'myday-outbox'
const OUTBOX_STORE = 'entries'
const OUTBOX_SYNC_TAG = 'myday-outbox'
const OUTBOX_SYNCED = 'outbox:synced'
const REFRESH_LOCK = 'myday-auth-refresh'

function settle(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openOutbox() {
  const request = indexedDB.open(OUTBOX_DB, 1)

  request.onupgradeneeded = () => {
    request.result.createObjectStore(OUTBOX_STORE, { keyPath: 'id' }).createIndex('userId', 'userId')
  }

  return settle(request)
}

async function inStore(mode, run) {
  const db = await openOutbox()

  try {
    return await settle(run(db.transaction(OUTBOX_STORE, mode).objectStore(OUTBOX_STORE)))
  } finally {
    db.close()
  }
}

function withRefreshLock(run) {
  return globalThis.navigator.locks ? globalThis.navigator.locks.request(REFRESH_LOCK, run) : run()
}

function subjectOf(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(atob(payload)).sub
  } catch {
    return undefined
  }
}

async function freshAccessToken() {
  const response = await withRefreshLock(() => fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' }))

  if (!response.ok) return undefined

  return (await response.json()).accessToken
}

function shouldRetry(status) {
  return status === 401 || status === 408 || status === 429 || status >= 500
}

async function syncOutbox() {
  const all = await inStore('readonly', store => store.getAll())

  if (all.length === 0) return

  const token = await freshAccessToken()
  const userId = token && subjectOf(token)

  if (!userId) return

  const entries = all.filter(entry => entry.userId === userId).sort((a, b) => a.createdAt - b.createdAt)
  let sent = 0

  try {
    for (const entry of entries) {
      const response = await fetch(entry.url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(entry.body)
      })

      if (shouldRetry(response.status)) throw new Error(`Outbox sync stopped with ${response.status}`)
      if (!response.ok) continue

      await inStore('readwrite', store => store.delete(entry.id))
      sent += 1
    }
  } finally {
    if (sent > 0) await announceSynced(sent)
  }
}

async function announceSynced(sent) {
  const windows = await globalThis.clients.matchAll({ type: 'window' })

  windows.forEach(client => client.postMessage({ type: OUTBOX_SYNCED, sent }))
}

globalThis.addEventListener('sync', (event) => {
  if (event.tag === OUTBOX_SYNC_TAG) event.waitUntil(syncOutbox())
})
