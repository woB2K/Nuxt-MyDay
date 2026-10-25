import type { Currency } from '~~/shared/currency'

const INTL_LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-US' }

export function intlLocale(locale: string): string {
  return INTL_LOCALES[locale] ?? locale
}

export function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function moneyFormat(currency: Currency, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

export function formatMoney(amount: number, currency: Currency, locale: string, sign = ''): string {
  return `${sign}${moneyFormat(currency, locale).format(amount)}`
}

export interface CurrencyAffix {
  prefix: string
  suffix: string
}

export function currencyAffix(currency: Currency, locale: string): CurrencyAffix {
  const parts = moneyFormat(currency, locale).formatToParts(0)
  const number = parts.findIndex(part => part.type === 'integer')
  const join = (list: Intl.NumberFormatPart[]) => list.map(part => part.value).join('').trim()

  return { prefix: join(parts.slice(0, number)), suffix: join(parts.slice(number + 1)) }
}

export function currencyName(currency: Currency, locale: string): string {
  return new Intl.DisplayNames(intlLocale(locale), { type: 'currency' }).of(currency) ?? currency
}
