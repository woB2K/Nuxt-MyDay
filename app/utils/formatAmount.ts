export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatMoney(amount: number, sign = ''): string {
  return `${sign}${formatAmount(amount)} ₽`
}
