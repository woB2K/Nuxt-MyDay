import { describe, expect, it } from 'vitest'
import { toCurrency } from '../../../shared/currency'
import { updateHouseholdSchema } from '../../../shared/schemas'

describe('updateHouseholdSchema', () => {
  it('принимает валюту из списка и режим копилки по отдельности', () => {
    expect(updateHouseholdSchema.parse({ currency: 'USD' })).toEqual({ currency: 'USD' })
    expect(updateHouseholdSchema.parse({ shareSavings: false })).toEqual({ shareSavings: false })
  })

  it('отклоняет валюту не из списка и пустое тело', () => {
    expect(updateHouseholdSchema.safeParse({ currency: 'usd' }).success).toBe(false)
    expect(updateHouseholdSchema.safeParse({ currency: 'XXX' }).success).toBe(false)
    expect(updateHouseholdSchema.safeParse({}).success).toBe(false)
  })
})

describe('toCurrency', () => {
  it('неизвестный код из БД превращает в рубль, известный оставляет', () => {
    expect(toCurrency('EUR')).toBe('EUR')
    expect(toCurrency('XXX')).toBe('RUB')
    expect(toCurrency(undefined)).toBe('RUB')
  })
})
