const DAY_MS = 24 * 60 * 60 * 1000

export function timestampRange(from?: string, to?: string): { gte?: Date, lt?: Date } | undefined {
  if (!from && !to) return undefined

  return {
    ...(from && { gte: new Date(`${from}T00:00:00.000Z`) }),
    ...(to && { lt: new Date(new Date(`${to}T00:00:00.000Z`).getTime() + DAY_MS) })
  }
}
