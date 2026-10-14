import type { CreateTransactionInput } from '~~/shared/types'
import { statusOf } from '~/utils/httpStatus'

export const OUTBOX_DB = 'myday-outbox'
export const OUTBOX_STORE = 'entries'
export const OUTBOX_SYNC_TAG = 'myday-outbox'
export const OUTBOX_SYNCED = 'outbox:synced'
export const TRANSACTIONS_URL = '/api/finance/transactions'

export type QueuedTransaction = CreateTransactionInput & { id: string }

export interface OutboxEntry {
  id: string
  userId: string
  url: string
  body: QueuedTransaction
  createdAt: number
}

export interface Delivery {
  sent: OutboxEntry[]
  rejected: OutboxEntry[]
}

export function transactionEntry(userId: string, body: QueuedTransaction): OutboxEntry {
  return { id: body.id, userId, url: TRANSACTIONS_URL, body, createdAt: Date.now() }
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openOutbox(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OUTBOX_DB, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(OUTBOX_STORE, { keyPath: 'id' }).createIndex('userId', 'userId')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function inStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openOutbox()

  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(OUTBOX_STORE, mode)
      const request = run(transaction.objectStore(OUTBOX_STORE))

      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function putOutboxEntry(entry: OutboxEntry): Promise<void> {
  if (!hasIndexedDb()) throw new Error('IndexedDB is unavailable')

  await inStore('readwrite', store => store.put(JSON.parse(JSON.stringify(entry))))
}

export async function outboxEntries(userId: string): Promise<OutboxEntry[]> {
  if (!hasIndexedDb()) return []

  const entries = await inStore<OutboxEntry[]>('readonly', store => store.index('userId').getAll(userId))

  return entries.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeOutboxEntry(id: string): Promise<void> {
  await inStore('readwrite', store => store.delete(id))
}

export async function clearOutbox(userId: string): Promise<void> {
  if (!hasIndexedDb()) return

  await inStore('readwrite', (store) => {
    const keys = store.index('userId').getAllKeys(userId)

    keys.onsuccess = () => keys.result.forEach(key => store.delete(key))

    return keys
  }).catch(() => {})
}

export function shouldRetry(error: unknown): boolean {
  const status = statusOf(error)

  return status === undefined || status === 401 || status === 408 || status === 429 || status >= 500
}

export async function deliver(
  entries: OutboxEntry[],
  send: (entry: OutboxEntry) => Promise<unknown>,
  remove: (id: string) => Promise<void>
): Promise<Delivery> {
  const delivery: Delivery = { sent: [], rejected: [] }

  for (const entry of entries) {
    try {
      await send(entry)
      delivery.sent.push(entry)
    } catch (error) {
      if (shouldRetry(error)) break

      delivery.rejected.push(entry)
    }

    await remove(entry.id)
  }

  return delivery
}

interface SyncCapableRegistration {
  sync?: { register: (tag: string) => Promise<void> }
}

export async function requestBackgroundSync(): Promise<void> {
  try {
    const registration = await (navigator as Partial<Navigator>).serviceWorker?.getRegistration()

    await (registration as SyncCapableRegistration | undefined)?.sync?.register(OUTBOX_SYNC_TAG)
  } catch {}
}
