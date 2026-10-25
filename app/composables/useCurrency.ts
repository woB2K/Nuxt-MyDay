import type { Currency } from '~~/shared/currency'
import { DEFAULT_CURRENCY } from '~~/shared/currency'
import { currencyAffix, currencyName, formatAmount, formatMoney } from '~/utils/formatAmount'

export function useCurrency() {
  const authStore = useAuthStore()
  const { locale } = useI18n()

  const currency = computed<Currency>(() => authStore.user?.currency ?? DEFAULT_CURRENCY)
  const affix = computed(() => currencyAffix(currency.value, locale.value))

  function amount(value: number): string {
    return formatAmount(value, locale.value)
  }

  function money(value: number, sign = '', code: Currency = currency.value): string {
    return formatMoney(value, code, locale.value, sign)
  }

  function name(code: Currency = currency.value): string {
    return currencyName(code, locale.value)
  }

  return { currency, affix, amount, money, name }
}
