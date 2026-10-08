const groupSeparator = ' '
const decimalSeparator = ','

export function parseAmountInput(text: string): string {
  const cleaned = text.replace(/[^\d.,]/g, '')
  const separatorAt = cleaned.search(/[.,]/)

  if (separatorAt === -1) return cleaned.replace(/^0+(?=\d)/, '')

  const integer = cleaned.slice(0, separatorAt).replace(/^0+(?=\d)/, '') || '0'
  const fraction = cleaned.slice(separatorAt + 1).replace(/[.,]/g, '').slice(0, 2)

  return `${integer}.${fraction}`
}

export function formatAmountInput(raw: string): string {
  const [integer = '', fraction] = raw.split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)

  return fraction === undefined ? grouped : `${grouped}${decimalSeparator}${fraction}`
}

export function countAmountChars(text: string): number {
  return text.replace(/[^\d.,]/g, '').length
}

export function caretAfterAmountChars(text: string, count: number): number {
  if (count <= 0) return 0

  let seen = 0

  for (let index = 0; index < text.length; index++) {
    if (/[\d.,]/.test(text[index]!)) seen += 1

    if (seen === count) return index + 1
  }

  return text.length
}
