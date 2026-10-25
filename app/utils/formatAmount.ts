import type { Currency } from '~~/shared/currency'

const INTL_LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-US' }

export function intlLocale(locale: string): string {
  return INTL_LOCALES[locale] ?? locale
}

function hasCents(amount: number): boolean {
  return Math.round(Math.abs(amount) * 100) % 100 !== 0
}

function currencyDigits(currency: Currency): number {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
}

export function formatAmount(amount: number, locale: string, digits = 2): string {
  const fraction = hasCents(amount) ? digits : 0

  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction
  }).format(amount)
}

function moneyFormat(currency: Currency, locale: string, fraction: number) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction
  })
}

export function formatMoney(amount: number, currency: Currency, locale: string, sign = ''): string {
  const fraction = hasCents(amount) ? currencyDigits(currency) : 0

  return `${sign}${moneyFormat(currency, locale, fraction).format(amount)}`
}

export interface CurrencyAffix {
  prefix: string
  suffix: string
}

export function currencyAffix(currency: Currency, locale: string): CurrencyAffix {
  const parts = moneyFormat(currency, locale, 0).formatToParts(0)
  const number = parts.findIndex(part => part.type === 'integer')
  const join = (list: Intl.NumberFormatPart[]) => list.map(part => part.value).join('').trim()

  return { prefix: join(parts.slice(0, number)), suffix: join(parts.slice(number + 1)) }
}

export function currencyName(currency: Currency, locale: string): string {
  return new Intl.DisplayNames(intlLocale(locale), { type: 'currency' }).of(currency) ?? currency
}

export function decimalSeparator(locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale)).formatToParts(1.5).find(part => part.type === 'decimal')?.value ?? ','
}
