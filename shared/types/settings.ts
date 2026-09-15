import type { z } from 'zod'
import type {
  accentSchema,
  langSchema,
  pinAttemptSchema,
  resetPinSchema,
  setPinSchema,
  themeSchema,
  updateSettingsSchema
} from '../schemas/settings'

export type ThemeSetting = z.infer<typeof themeSchema>
export type AccentSetting = z.infer<typeof accentSchema>
export type LangSetting = z.infer<typeof langSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type SetPinInput = z.infer<typeof setPinSchema>
export type PinAttemptInput = z.infer<typeof pinAttemptSchema>
export type ResetPinInput = z.infer<typeof resetPinSchema>

export type PinResetMethod = 'password' | 'oauth'

export interface PinStatus {
  enabled: boolean
  resetVia: PinResetMethod
}

export interface UserSettings {
  theme: string
  accent: string
  lang: string
  pinEnabled: boolean
}
