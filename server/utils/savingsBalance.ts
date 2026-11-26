export interface SavingsSumRow {
  type: string
  _sum: { amount: { toNumber: () => number } | null }
}

const BALANCE_SIGN: Record<string, number> = { OPENING: 1, DEPOSIT: 1, WITHDRAWAL: -1, ADJUSTMENT: 1 }

export function sumOfType(rows: SavingsSumRow[], type: string): number | null {
  const matching = rows.filter(row => row.type === type && row._sum.amount)

  return matching.length ? matching.reduce((sum, row) => sum + row._sum.amount!.toNumber(), 0) : null
}

export function savingsBalanceOf(rows: SavingsSumRow[]): number {
  return roundMoney(rows.reduce((sum, row) => sum + (BALANCE_SIGN[row.type] ?? 0) * (row._sum.amount?.toNumber() ?? 0), 0))
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}
