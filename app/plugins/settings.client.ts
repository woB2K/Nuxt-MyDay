import type { UserSettings } from '~~/shared/types'
import type { AccentName } from '~/utils/accents'
import { isThemePreference } from '~/composables/useTheme'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { defaultAccent, toAccentName } from '~/utils/accents'

export const accentStorageKey = 'myday-accent'

function readAccent(): AccentName {
  try {
    return toAccentName(localStorage.getItem(accentStorageKey))
  } catch {
    return defaultAccent
  }
}

function writeAccent(value: AccentName): void {
  try {
    localStorage.setItem(accentStorageKey, value)
  } catch {

  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const ui = useUiStore()
  const authStore = useAuthStore()
  const colorMode = useColorMode()
  const i18n = nuxtApp.$i18n as { setLocale: (code: 'en' | 'ru') => Promise<void> }

  let localeChange = Promise.resolve()

  ui.accent = readAccent()

  watch(() => ui.accent, writeAccent)

  watch(() => authStore.user?.settings, (settings: UserSettings | undefined) => {
    if (!settings) return

    if (isThemePreference(settings.theme)) colorMode.preference = settings.theme

    ui.accent = toAccentName(settings.accent)

    const lang = settings.lang
    if (lang === 'en' || lang === 'ru') localeChange = localeChange.then(() => i18n.setLocale(lang), () => i18n.setLocale(lang))
  }, { immediate: true })
})
