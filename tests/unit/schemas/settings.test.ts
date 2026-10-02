import { describe, expect, it } from 'vitest'
import { updateSettingsSchema } from '../../../shared/schemas/settings'

describe('updateSettingsSchema', () => {
  it('accepts a partial update', () => {
    expect(updateSettingsSchema.safeParse({ theme: 'system' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ accent: 'teal', lang: 'ru' }).success).toBe(true)
  })

  it('rejects an empty body so a no-op never hits the database', () => {
    expect(updateSettingsSchema.safeParse({}).success).toBe(false)
  })

  it('rejects values outside the supported sets', () => {
    expect(updateSettingsSchema.safeParse({ theme: 'sepia' }).success).toBe(false)
    expect(updateSettingsSchema.safeParse({ lang: 'de' }).success).toBe(false)
  })

  it('rejects a raw hex accent, since the column now stores names', () => {
    expect(updateSettingsSchema.safeParse({ accent: '#A78BFA' }).success).toBe(false)
  })
})
