import { REMINDER_STEP_MINUTES } from '~~/shared/schemas'

export type PushAvailability = 'ready' | 'needsInstall' | 'unsupported' | 'unconfigured'

export const pushPromptStorageKey = 'myday:pushPrompt'

export interface PushEnvironment {
  hasServiceWorker: boolean
  hasPushManager: boolean
  hasNotification: boolean
  iosBrowserTab: boolean
  vapidKey: string
}

export function pushAvailability(env: PushEnvironment): PushAvailability {
  if (env.iosBrowserTab) return 'needsInstall'
  if (!env.hasServiceWorker || !env.hasPushManager || !env.hasNotification) return 'unsupported'
  if (!env.vapidKey) return 'unconfigured'

  return 'ready'
}

export function vapidKeyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64Url + '='.repeat((4 - base64Url.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))

  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index)

  return bytes
}

export function snapReminderTime(value: string): string | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)

  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) return null

  const snapped = minutes - minutes % REMINDER_STEP_MINUTES

  return `${match[1]}:${String(snapped).padStart(2, '0')}`
}

export function readPushPromptSeen(): boolean {
  try {
    return localStorage.getItem(pushPromptStorageKey) === '1'
  } catch {
    return false
  }
}

export function writePushPromptSeen(): void {
  try {
    localStorage.setItem(pushPromptStorageKey, '1')
  } catch {}
}

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}
