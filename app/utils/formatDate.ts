const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function toDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function fromDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year!, month! - 1, day!)
}

function toLocalDate(value: Date | string): Date {
  if (typeof value === 'string') {
    const plain = value.slice(0, 10)
    if (DATE_ONLY.test(plain)) return fromDateString(plain)
  }

  return new Date(value)
}

export function formatDate(dateString?: Date | string): string {
  if (!dateString) return ''

  const date = toLocalDate(dateString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export function formatDay(dateString?: Date | string): string {
  if (!dateString) return ''

  const date = toLocalDate(dateString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${day}.${month}`
}

export function formatDateTime(dateString?: Date | string): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}
