export type InstallPlatform = 'ios' | 'android' | 'unknown'
export type InstallBrowser = 'safari' | 'other'
export type StepVisualKind = 'share' | 'menuAdd' | 'add' | 'kebab' | 'menuInstall' | 'install'

export interface InstallDevice {
  platform: InstallPlatform
  browser: InstallBrowser
}

export interface InstallMemory {
  dismissCount: number
  snoozeUntil: number
  installed: boolean
}

const dayMs = 24 * 60 * 60 * 1000
const snoozeDays = [14, 30]
export const maxBannerDismissals = snoozeDays.length + 1

const iosOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|GSA\//

export function detectInstallDevice(userAgent: string): InstallDevice | null {
  if (/iPad/.test(userAgent)) return null

  if (/iPhone|iPod/.test(userAgent)) {
    return { platform: 'ios', browser: iosOtherBrowser.test(userAgent) ? 'other' : 'safari' }
  }

  if (/Android/.test(userAgent)) {
    return /Mobile/.test(userAgent) ? { platform: 'android', browser: 'other' } : null
  }

  if (/Mobi/.test(userAgent)) return { platform: 'unknown', browser: 'other' }

  return null
}

export function emptyInstallMemory(): InstallMemory {
  return { dismissCount: 0, snoozeUntil: 0, installed: false }
}

export function parseInstallMemory(raw: string | null): InstallMemory {
  if (!raw) return emptyInstallMemory()

  try {
    const value = JSON.parse(raw) as Partial<InstallMemory>

    return {
      dismissCount: Number.isInteger(value.dismissCount) ? Number(value.dismissCount) : 0,
      snoozeUntil: Number.isFinite(value.snoozeUntil) ? Number(value.snoozeUntil) : 0,
      installed: value.installed === true
    }
  } catch {
    return emptyInstallMemory()
  }
}

export function dismissInstallBanner(memory: InstallMemory, now: number): InstallMemory {
  const dismissCount = memory.dismissCount + 1
  const days = snoozeDays[dismissCount - 1] ?? 0

  return { ...memory, dismissCount, snoozeUntil: now + days * dayMs }
}

export function isInstallBannerDue(memory: InstallMemory, now: number): boolean {
  return !memory.installed && memory.dismissCount < maxBannerDismissals && now >= memory.snoozeUntil
}
