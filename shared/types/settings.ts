import type { z } from 'zod'
import type { accentSchema, langSchema, themeSchema, updateSettingsSchema } from '../schemas/settings'

export type ThemeSetting = z.infer<typeof themeSchema>
export type AccentSetting = z.infer<typeof accentSchema>
export type LangSetting = z.infer<typeof langSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

export interface UserSettings {
  theme: string
  accent: string
  lang: string
  pinEnabled: boolean
  pinHash: string | null
}
