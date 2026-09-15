export const accentNames = ['violet', 'teal', 'amber', 'sky', 'rose'] as const

export type AccentName = typeof accentNames[number]

export interface AccentSwatch {
  dark: string
  light: string
}

export const defaultAccent: AccentName = 'violet'

export const accentSwatches: Record<AccentName, AccentSwatch> = {
  violet: { dark: '#A78BFA', light: '#6D3FD4' },
  teal: { dark: '#2DD4BF', light: '#0D9488' },
  amber: { dark: '#F59E0B', light: '#B45309' },
  sky: { dark: '#38BDF8', light: '#0284C7' },
  rose: { dark: '#FB7185', light: '#E11D48' }
}

export function isAccentName(value: unknown): value is AccentName {
  return typeof value === 'string' && accentNames.includes(value as AccentName)
}

export function toAccentName(stored: unknown): AccentName {
  if (isAccentName(stored)) return stored

  if (typeof stored === 'string') {
    const hex = stored.toUpperCase()
    const matched = accentNames.find(name =>
      accentSwatches[name].dark.toUpperCase() === hex || accentSwatches[name].light.toUpperCase() === hex)

    if (matched) return matched
  }

  return defaultAccent
}
