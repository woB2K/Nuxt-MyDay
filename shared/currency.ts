export const CURRENCIES = [
  'RUB',
  'USD',
  'EUR',
  'BYN',
  'KZT',
  'UAH',
  'UZS',
  'KGS',
  'AMD',
  'GEL',
  'AZN',
  'TRY',
  'RSD',
  'GBP',
  'PLN',
  'CZK',
  'CHF',
  'ILS',
  'AED',
  'CNY',
  'INR',
  'THB',
  'JPY',
  'CAD',
  'AUD'
] as const

export type Currency = typeof CURRENCIES[number]

export const DEFAULT_CURRENCY: Currency = 'RUB'

export function toCurrency(value: string | null | undefined): Currency {
  return CURRENCIES.find(code => code === value) ?? DEFAULT_CURRENCY
}
