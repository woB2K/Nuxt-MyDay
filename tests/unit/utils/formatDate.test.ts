import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatDate, formatDateTime, formatDay, toDateString, toDayKey } from '../../../app/utils/formatDate'

afterEach(() => {
  vi.useRealTimers()
})

describe('toDateString', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 8, 1))).toBe('2026-09-01')
    expect(toDateString(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('uses the local calendar day, not the UTC one', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 1, 1, 30))
    expect(toDateString()).toBe('2026-09-01')

    vi.setSystemTime(new Date(2026, 8, 30, 23, 45))
    expect(toDateString()).toBe('2026-09-30')
  })
})

describe('toDayKey', () => {
  it('takes the calendar day out of a server timestamp without shifting it', () => {
    expect(toDayKey('2026-07-24T00:00:00.000Z')).toBe('2026-07-24')
    expect(toDayKey('2026-07-24')).toBe('2026-07-24')
  })

  it('reads a Date as the UTC day — that is how @db.Date materializes', () => {
    expect(toDayKey(new Date('2026-07-24T00:00:00.000Z'))).toBe('2026-07-24')
  })
})

describe('formatDate', () => {
  it('formats a date-only string as the same calendar day', () => {
    expect(formatDate('2026-09-01')).toBe('01.09.2026')
  })

  it('formats a Date', () => {
    expect(formatDate(new Date(2026, 8, 1))).toBe('01.09.2026')
  })

  it('returns an empty string for no input', () => {
    expect(formatDate()).toBe('')
  })
})

describe('formatDay', () => {
  it('keeps the calendar day of a date-only string', () => {
    expect(formatDay('2026-09-01')).toBe('01.09')
  })
})

describe('formatDateTime', () => {
  it('formats a timestamp with time', () => {
    expect(formatDateTime(new Date(2026, 8, 1, 14, 5))).toBe('01.09.2026 14:05')
  })
})
