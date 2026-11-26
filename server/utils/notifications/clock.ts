export const REMINDER_WINDOW_MINUTES = 120

const MINUTES_PER_DAY = 24 * 60

export interface LocalClock {
  date: string
  minutes: number
}

function formatter(timeZone: string): Intl.DateTimeFormat {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const

  try {
    return new Intl.DateTimeFormat('en-CA', { ...options, timeZone })
  } catch {
    return new Intl.DateTimeFormat('en-CA', { ...options, timeZone: 'UTC' })
  }
}

export function localClock(now: Date, timeZone: string): LocalClock {
  const parts = Object.fromEntries(formatter(timeZone).formatToParts(now).map(part => [part.type, part.value]))

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  }
}

export function reminderMinutes(value: string): number {
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
}

export function inReminderWindow(minutes: number, at: string): boolean {
  const start = reminderMinutes(at)

  return minutes >= start && minutes < Math.min(start + REMINDER_WINDOW_MINUTES, MINUTES_PER_DAY)
}
