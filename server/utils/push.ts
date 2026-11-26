import type { PushSender } from './notifications/webPush'
import { createWebPushSender } from './notifications/webPush'

let cached: { sender: PushSender | null } | null = null

export function pushSender(): PushSender | null {
  if (cached) return cached.sender

  const config = useRuntimeConfig()

  cached = {
    sender: createWebPushSender({
      publicKey: config.vapidPublicKey,
      privateKey: config.vapidPrivateKey,
      subject: config.vapidSubject
    })
  }

  return cached.sender
}
