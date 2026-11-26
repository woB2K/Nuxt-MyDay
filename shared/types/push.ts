import type { z } from 'zod'
import type { pushSubscriptionSchema, pushUnsubscribeSchema } from '../schemas/push'

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>

export interface PushTestResult {
  sent: number
}

export interface PushKey {
  publicKey: string | null
}
