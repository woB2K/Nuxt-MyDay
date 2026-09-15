import type { AccentName } from '~/utils/accents'
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

export default defineNuxtPlugin(() => {
  const ui = useUiStore()

  ui.accent = readAccent()

  watch(() => ui.accent, writeAccent)
})
