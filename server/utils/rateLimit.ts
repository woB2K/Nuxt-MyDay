import type { H3Event } from 'h3'
import { createError, getRequestHeader, getRequestIP, setResponseHeader } from 'h3'

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

export interface ProxyOptions {
  proxyHops: number
  clientIpHeader: string
}

export function clientIp(event: H3Event, { proxyHops, clientIpHeader }: ProxyOptions): string | undefined {
  const direct = clientIpHeader ? getRequestHeader(event, clientIpHeader)?.trim() : undefined
  if (direct) return direct

  const forwarded = proxyHops > 0
    ? getRequestHeader(event, 'x-forwarded-for')
        ?.split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : undefined

  return forwarded?.at(-proxyHops) ?? getRequestIP(event)
}
