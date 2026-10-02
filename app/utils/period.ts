import { fromDateString, toDateString } from './formatDate'

export type PeriodPreset = 'thisMonth' | 'lastMonth' | 'last3' | 'thisYear' | 'all' | 'custom'

export type Period
  = | { mode: 'month', month: string, preset: PeriodPreset }
    | { mode: 'range', from: string, to: string, preset: PeriodPreset }
    | { mode: 'all', preset: PeriodPreset }

export interface PeriodRange {
  from: string
  to: string
}

export function monthStart(value: Date | string = new Date()): string {
  const date = typeof value === 'string' ? fromDateString(value) : value

  return toDateString(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function monthEnd(month: string): string {
  const date = fromDateString(month)

  return toDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function shiftMonth(month: string, step: number): string {
  const date = fromDateString(month)

  return toDateString(new Date(date.getFullYear(), date.getMonth() + step, 1))
}

export function monthPeriod(month: string): Period {
  const current = monthStart()
  const preset: PeriodPreset = month === current
    ? 'thisMonth'
    : month === shiftMonth(current, -1) ? 'lastMonth' : 'custom'

  return { mode: 'month', month, preset }
}

export function rangePeriod(from: string, to: string): Period {
  return { mode: 'range', from, to, preset: 'custom' }
}

export const periodPresets = {
  thisMonth: (): Period => monthPeriod(monthStart()),
  lastMonth: (): Period => monthPeriod(shiftMonth(monthStart(), -1)),
  last3: (): Period => ({
    mode: 'range',
    from: shiftMonth(monthStart(), -2),
    to: monthEnd(monthStart()),
    preset: 'last3'
  }),
  thisYear: (): Period => {
    const year = new Date().getFullYear()

    return { mode: 'range', from: `${year}-01-01`, to: `${year}-12-31`, preset: 'thisYear' }
  },
  all: (): Period => ({ mode: 'all', preset: 'all' })
}

export type PeriodPresetKey = keyof typeof periodPresets

export const periodPresetKeys = Object.keys(periodPresets) as PeriodPresetKey[]

export function periodRange(period: Period): PeriodRange | null {
  if (period.mode === 'all') return null
  if (period.mode === 'month') return { from: period.month, to: monthEnd(period.month) }

  return { from: period.from, to: period.to }
}

export function periodKey(period: Period): string {
  const range = periodRange(period)

  return range ? `${range.from}_${range.to}` : 'all'
}
