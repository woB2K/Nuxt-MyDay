import type { H3Event } from 'h3'
import { createError, setResponseHeader } from 'h3'

const store = new Map<string, { count: number, resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 10 * 60 * 1000)

export function checkRateLimit(event: H3Event, key: string, maxAttempts: number, windowMs: number): void {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= maxAttempts) {
    setResponseHeader(event, 'Retry-After', Math.ceil((entry.resetAt - now) / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  entry.count++
}
