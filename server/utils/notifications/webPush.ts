import type { PushPayload } from './messages'
import webpush from 'web-push'

export type PushOutcome = 'ok' | 'gone' | 'error'

export interface PushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

export type PushSender = (target: PushTarget, payload: PushPayload) => Promise<PushOutcome>

export interface VapidConfig {
  publicKey: string
  privateKey: string
  subject: string
}

const PUSH_TTL_SECONDS = 2 * 60 * 60
const GONE_STATUSES = new Set([404, 410])

export function createWebPushSender(vapid: VapidConfig): PushSender | null {
  if (!vapid.publicKey || !vapid.privateKey || !vapid.subject) return null

  const options = {
    TTL: PUSH_TTL_SECONDS,
    vapidDetails: { subject: vapid.subject, publicKey: vapid.publicKey, privateKey: vapid.privateKey }
  }

  return async (target, payload) => {
    try {
      await webpush.sendNotification(
        { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
        JSON.stringify(payload),
        options
      )

      return 'ok'
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode

      if (status !== undefined && GONE_STATUSES.has(status)) return 'gone'

      console.error('[push] delivery failed', status ?? error)

      return 'error'
    }
  }
}
