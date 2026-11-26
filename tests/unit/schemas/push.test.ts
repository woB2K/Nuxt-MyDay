import { describe, expect, it } from 'vitest'
import { isPushServiceEndpoint, pushSubscriptionSchema, pushUnsubscribeSchema, reminderTimeSchema, timezoneSchema } from '../../../shared/schemas/push'
import { updateSettingsSchema } from '../../../shared/schemas/settings'

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  expirationTime: null,
  keys: { p256dh: 'BOr-key', auth: 'auth-secret' }
}

describe('reminderTimeSchema', () => {
  it('accepts HH:MM on a five-minute step', () => {
    expect(reminderTimeSchema.safeParse('00:00').success).toBe(true)
    expect(reminderTimeSchema.safeParse('21:00').success).toBe(true)
    expect(reminderTimeSchema.safeParse('23:55').success).toBe(true)
  })

  it('rejects other shapes, out-of-range values and off-step minutes', () => {
    for (const value of ['9:00', '24:00', '12:60', '21:03', '21:00:00', ''])
      expect(reminderTimeSchema.safeParse(value).success, value).toBe(false)
  })
})

describe('timezoneSchema', () => {
  it('accepts IANA zones, including legacy aliases', () => {
    expect(timezoneSchema.parse('Europe/Moscow')).toBe('Europe/Moscow')
    expect(timezoneSchema.safeParse('Europe/Kiev').success).toBe(true)
    expect(timezoneSchema.safeParse('Pacific/Kiritimati').success).toBe(true)
  })

  it('rejects unknown zones', () => {
    expect(timezoneSchema.safeParse('Mars/Olympus').success).toBe(false)
    expect(timezoneSchema.safeParse('').success).toBe(false)
  })
})

describe('pushSubscriptionSchema', () => {
  it('takes the browser PushSubscription JSON as is', () => {
    expect(pushSubscriptionSchema.safeParse(subscription).success).toBe(true)
  })

  it('accepts only https endpoints', () => {
    expect(pushSubscriptionSchema.safeParse({ ...subscription, endpoint: 'http://push.example/abc' }).success).toBe(false)
    expect(pushUnsubscribeSchema.safeParse({ endpoint: 'javascript:alert(1)' }).success).toBe(false)
  })

  it('accepts only the browsers’ push services, so the server never calls an arbitrary host', () => {
    for (const endpoint of [
      'https://fcm.googleapis.com/fcm/send/abc',
      'https://updates.push.services.mozilla.com/wpush/v2/abc',
      'https://web.push.apple.com/QGx',
      'https://wns2-par02p.notify.windows.com/w/?token=abc'
    ]) expect(isPushServiceEndpoint(endpoint), endpoint).toBe(true)

    for (const endpoint of [
      'https://127.0.0.1/abc',
      'https://10.0.0.5/push',
      'https://fcm.googleapis.com.evil.example/abc',
      'https://evilnotify.windows.com/abc',
      'https://fcm.googleapis.com:8443/abc',
      'https://user:pass@fcm.googleapis.com/abc',
      'http://fcm.googleapis.com/abc'
    ]) expect(isPushServiceEndpoint(endpoint), endpoint).toBe(false)

    expect(pushSubscriptionSchema.safeParse({ ...subscription, endpoint: 'https://169.254.169.254/latest' }).success).toBe(false)
  })

  it('requires both keys', () => {
    expect(pushSubscriptionSchema.safeParse({ ...subscription, keys: { p256dh: 'x' } }).success).toBe(false)
  })
})

describe('updateSettingsSchema — notifications', () => {
  it('turns a reminder on and off', () => {
    expect(updateSettingsSchema.safeParse({ remindFinanceAt: '21:00' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ remindTasksAt: null }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ remindTasksAt: '9am' }).success).toBe(false)
  })

  it('stores the hide-amounts flag and the time zone', () => {
    expect(updateSettingsSchema.parse({ hideAmounts: true, timezone: 'Asia/Tokyo' })).toEqual({ hideAmounts: true, timezone: 'Asia/Tokyo' })
  })
})
