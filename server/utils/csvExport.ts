export const EXPORT_HEADER = ['date', 'type', 'amount', 'currency', 'category', 'tags', 'notes', 'author']

export function categoryName(category: { name: string, key: string | null }, names: Record<string, string>): string {
  return (category.key && names[category.key]) || category.name
}

export function safeText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) || /^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toCsv(rows: string[][]): string {
  return `\uFEFF${rows.map(row => row.map(escapeCell).join(',')).join('\r\n')}\r\n`
}

export function exportAmount(amount: number): string {
  return String(Math.round(amount * 100) / 100)
}
