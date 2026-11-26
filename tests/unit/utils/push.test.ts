import { beforeEach, describe, expect, it } from 'vitest'
import { pushAvailability, pushPromptStorageKey, readPushPromptSeen, snapReminderTime, vapidKeyBytes, writePushPromptSeen } from '../../../app/utils/push'

const full = { hasServiceWorker: true, hasPushManager: true, hasNotification: true, iosBrowserTab: false, vapidKey: 'key' }

describe('pushAvailability', () => {
  it('is ready when the browser has push and the server has a key', () => {
    expect(pushAvailability(full)).toBe('ready')
  })

  it('asks iPhone users in a Safari tab to install the app first', () => {
    expect(pushAvailability({ ...full, hasPushManager: false, iosBrowserTab: true })).toBe('needsInstall')
  })

  it('reports a browser without the Push API as unsupported', () => {
    expect(pushAvailability({ ...full, hasPushManager: false })).toBe('unsupported')
    expect(pushAvailability({ ...full, hasNotification: false })).toBe('unsupported')
  })

  it('reports a server without VAPID keys as unconfigured', () => {
    expect(pushAvailability({ ...full, vapidKey: '' })).toBe('unconfigured')
  })
})

describe('vapidKeyBytes', () => {
  it('decodes url-safe base64 without padding', () => {
    expect([...vapidKeyBytes('-_8')]).toEqual([251, 255])
    expect([...vapidKeyBytes('AQID')]).toEqual([1, 2, 3])
  })
})

describe('snapReminderTime', () => {
  it('rounds minutes down to the five-minute step the server accepts', () => {
    expect(snapReminderTime('07:32')).toBe('07:30')
    expect(snapReminderTime('21:00')).toBe('21:00')
    expect(snapReminderTime('23:59:30')).toBe('23:55')
  })

  it('rejects empty or broken values', () => {
    expect(snapReminderTime('')).toBeNull()
    expect(snapReminderTime('25:00')).toBeNull()
  })
})

describe('push prompt memory', () => {
  beforeEach(() => localStorage.clear())

  it('remembers that the prompt was shown on this device', () => {
    expect(readPushPromptSeen()).toBe(false)
    writePushPromptSeen()
    expect(localStorage.getItem(pushPromptStorageKey)).toBe('1')
    expect(readPushPromptSeen()).toBe(true)
  })
})
