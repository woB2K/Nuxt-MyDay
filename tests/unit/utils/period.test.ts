import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  monthEnd,
  monthPeriod,
  monthStart,
  periodKey,
  periodPresetKeys,
  periodPresets,
  periodRange,
  rangePeriod,
  shiftMonth
} from '../../../app/utils/period'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 24, 23, 40))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('monthStart / monthEnd', () => {
  it('takes the local calendar month of "now" by default', () => {
    expect(monthStart()).toBe('2026-07-01')
  })

  it('accepts a date-only string and a Date', () => {
    expect(monthStart('2026-07-24')).toBe('2026-07-01')
    expect(monthStart(new Date(2026, 1, 28))).toBe('2026-02-01')
  })

  it('resolves the last day of the month, including leap February', () => {
    expect(monthEnd('2026-07-01')).toBe('2026-07-31')
    expect(monthEnd('2026-02-01')).toBe('2026-02-28')
    expect(monthEnd('2028-02-01')).toBe('2028-02-29')
  })
})

describe('shiftMonth', () => {
  it('steps months across year boundaries', () => {
    expect(shiftMonth('2026-07-01', 1)).toBe('2026-08-01')
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01')
    expect(shiftMonth('2026-12-01', 2)).toBe('2027-02-01')
  })
})

describe('monthPeriod', () => {
  it('recognizes the current and previous month as presets', () => {
    expect(monthPeriod('2026-07-01').preset).toBe('thisMonth')
    expect(monthPeriod('2026-06-01').preset).toBe('lastMonth')
    expect(monthPeriod('2026-04-01').preset).toBe('custom')
  })
})

describe('periodPresets', () => {
  it('covers the five presets from the design', () => {
    expect(periodPresetKeys).toEqual(['thisMonth', 'lastMonth', 'last3', 'thisYear', 'all'])
  })

  it('builds ranges relative to the local "today"', () => {
    expect(periodRange(periodPresets.thisMonth())).toEqual({ from: '2026-07-01', to: '2026-07-31' })
    expect(periodRange(periodPresets.lastMonth())).toEqual({ from: '2026-06-01', to: '2026-06-30' })
    expect(periodRange(periodPresets.last3())).toEqual({ from: '2026-05-01', to: '2026-07-31' })
    expect(periodRange(periodPresets.thisYear())).toEqual({ from: '2026-01-01', to: '2026-12-31' })
    expect(periodRange(periodPresets.all())).toBeNull()
  })
})

describe('periodRange', () => {
  it('expands a month to its first and last day', () => {
    expect(periodRange(monthPeriod('2026-02-01'))).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  })

  it('passes a custom range through untouched', () => {
    expect(periodRange(rangePeriod('2026-03-14', '2026-04-02')))
      .toEqual({ from: '2026-03-14', to: '2026-04-02' })
  })

  it('returns null for "all" — the request goes without from/to', () => {
    expect(periodRange(periodPresets.all())).toBeNull()
  })
})

describe('periodKey', () => {
  it('gives equal keys to equal ranges regardless of mode', () => {
    expect(periodKey(monthPeriod('2026-07-01'))).toBe(periodKey(rangePeriod('2026-07-01', '2026-07-31')))
  })

  it('distinguishes periods and names "all"', () => {
    expect(periodKey(monthPeriod('2026-07-01'))).not.toBe(periodKey(monthPeriod('2026-06-01')))
    expect(periodKey(periodPresets.all())).toBe('all')
  })
})
