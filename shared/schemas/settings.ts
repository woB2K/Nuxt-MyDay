import { z } from 'zod'

export const themeSchema = z.enum(['light', 'dark', 'system'])
export const accentSchema = z.enum(['violet', 'teal', 'amber', 'sky', 'rose'])
export const langSchema = z.enum(['en', 'ru'])

export const updateSettingsSchema = z.object({
  theme: themeSchema.optional(),
  accent: accentSchema.optional(),
  lang: langSchema.optional()
}).refine(body => Object.keys(body).length > 0, { message: 'No settings to update' })

export const pinLength = 4

export const pinSchema = z.string().regex(new RegExp(`^\\d{${pinLength}}$`), 'PIN must be 4 digits')

export const setPinSchema = z.object({
  pin: pinSchema,
  currentPin: pinSchema.optional()
})

export const pinAttemptSchema = z.object({ pin: pinSchema })

export const resetPinSchema = z.object({ password: z.string().min(1) })
