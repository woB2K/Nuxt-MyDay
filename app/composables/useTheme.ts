import type { AccentName } from '~/utils/accents'
import { useUiStore } from '~/stores/ui'
import { accentSwatches } from '~/utils/accents'

export const themePreferences = ['light', 'dark', 'system'] as const

export type ThemePreference = typeof themePreferences[number]

export const themeSurfaces: Record<'light' | 'dark', string> = {
  light: '#F4F4F8',
  dark: '#0F0F14'
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && themePreferences.includes(value as ThemePreference)
}

export function useTheme() {
  const colorMode = useColorMode()
  const ui = useUiStore()

  const preference = computed<ThemePreference>({
    get: () => isThemePreference(colorMode.preference) ? colorMode.preference : 'system',
    set: (value) => {
      colorMode.preference = value
    }
  })

  const resolved = computed<'light' | 'dark'>(() => colorMode.value === 'light' ? 'light' : 'dark')

  const accent = computed<AccentName>({
    get: () => ui.accent,
    set: (value) => {
      ui.accent = value
    }
  })

  const accentColor = computed(() => accentSwatches[accent.value][resolved.value])
  const surfaceColor = computed(() => themeSurfaces[resolved.value])

  function setTheme(value: ThemePreference) {
    preference.value = value
  }

  function setAccent(value: AccentName) {
    accent.value = value
  }

  return { preference, resolved, accent, accentColor, surfaceColor, setTheme, setAccent }
}
