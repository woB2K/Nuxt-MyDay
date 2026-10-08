import type { InstallDevice, InstallMemory } from '~/utils/pwaInstall'
import {
  detectInstallDevice,
  dismissInstallBanner,
  emptyInstallMemory,
  isInstallBannerDue,
  parseInstallMemory
} from '~/utils/pwaInstall'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

export const installStorageKey = 'myday:install'

const device = shallowRef<InstallDevice | null>(null)
const standalone = ref(false)
const memory = ref<InstallMemory>(emptyInstallMemory())
const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
const promptDismissed = ref(false)

let listeners: AbortController | null = null

function readMemory(): InstallMemory {
  try {
    return parseInstallMemory(localStorage.getItem(installStorageKey))
  } catch {
    return emptyInstallMemory()
  }
}

function writeMemory(value: InstallMemory) {
  memory.value = value

  try {
    localStorage.setItem(installStorageKey, JSON.stringify(value))
  } catch {}
}

function isStandalone() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true

  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

export function startPwaInstall() {
  listeners?.abort()
  listeners = new AbortController()

  device.value = detectInstallDevice(navigator.userAgent)
  standalone.value = isStandalone()
  memory.value = readMemory()
  deferredPrompt.value = null
  promptDismissed.value = false

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  }, { signal: listeners.signal })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    writeMemory({ ...memory.value, installed: true })
  }, { signal: listeners.signal })
}

export function usePwaInstall() {
  const installed = computed(() => memory.value.installed)
  const eligible = computed(() => device.value !== null && !standalone.value && !installed.value)
  const platform = computed(() => device.value?.platform ?? 'unknown')
  const browser = computed(() => device.value?.browser ?? 'other')
  const canPrompt = computed(() => deferredPrompt.value !== null)
  const bannerVisible = computed(() => eligible.value && isInstallBannerDue(memory.value, Date.now()))

  function dismissBanner() {
    writeMemory(dismissInstallBanner(memory.value, Date.now()))
  }

  async function install(): Promise<InstallOutcome> {
    const event = deferredPrompt.value

    if (!event) return 'unavailable'

    deferredPrompt.value = null

    await event.prompt()
    const { outcome } = await event.userChoice

    if (outcome === 'dismissed') promptDismissed.value = true

    return outcome
  }

  return {
    eligible,
    installed,
    platform,
    browser,
    canPrompt,
    promptDismissed: readonly(promptDismissed),
    bannerVisible,
    dismissBanner,
    install
  }
}
