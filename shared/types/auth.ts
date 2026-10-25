import type { z } from 'zod'
import type { Currency } from '../currency'
import type { loginSchema, oauthCallbackSchema, registerSchema } from '../schemas/auth'
import type { UserSettings } from './settings'

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>

export interface InstanceInfo {
  registration: boolean
  demo: { email: string, password: string } | null
}

export interface UserProfile {
  id: string
  name: string
  email: string | null
  currency: Currency
  settings: UserSettings
}
