const DAY_MS = 24 * 60 * 60 * 1000

export function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number)

  return Math.round(Date.UTC(year!, month! - 1, day!) / DAY_MS)
}

export function fromDayNumber(value: number): string {
  return new Date(value * DAY_MS).toISOString().slice(0, 10)
}

export function shiftDay(date: string, days: number): string {
  return fromDayNumber(dayNumber(date) + days)
}

export function weekdayIndex(date: string): number {
  return (dayNumber(date) % 7 + 10) % 7
}

export function weekStart(date: string): string {
  return shiftDay(date, -weekdayIndex(date))
}
