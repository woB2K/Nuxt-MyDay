import { z } from 'zod'

export const REMINDER_STEP_MINUTES = 5
export const DEFAULT_FINANCE_REMINDER = '21:00'
export const DEFAULT_TASKS_REMINDER = '09:00'
export const DEFAULT_HABIT_REMINDER = '08:00'
export const MAX_ENDPOINT_LENGTH = 2048

export const reminderTimeSchema = z.string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM')
  .refine(value => Number(value.slice(3)) % REMINDER_STEP_MINUTES === 0, { message: `Minutes must be a multiple of ${REMINDER_STEP_MINUTES}` })

export const timezoneSchema = z.string().min(1).max(64).transform((value, ctx) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: value }).resolvedOptions().timeZone
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Unknown time zone' })
    return z.NEVER
  }
})

const PUSH_SERVICE_HOSTS = new Set([
  'fcm.googleapis.com',
  'android.googleapis.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com'
])

const PUSH_SERVICE_SUFFIXES = ['.notify.windows.com']

export function isPushServiceEndpoint(endpoint: string): boolean {
  let url: URL

  try {
    url = new URL(endpoint)
  } catch {
    return false
  }

  if (url.protocol !== 'https:' || url.port !== '' || url.username || url.password) return false

  const host = url.hostname.toLowerCase()

  return PUSH_SERVICE_HOSTS.has(host) || PUSH_SERVICE_SUFFIXES.some(suffix => host.endsWith(suffix))
}

const endpointSchema = z.url({ protocol: /^https$/ })
  .max(MAX_ENDPOINT_LENGTH)
  .refine(isPushServiceEndpoint, { message: 'Unsupported push service' })

export const pushSubscriptionSchema = z.object({
  endpoint: endpointSchema,
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(128)
  })
})

export const pushUnsubscribeSchema = z.object({ endpoint: endpointSchema })
