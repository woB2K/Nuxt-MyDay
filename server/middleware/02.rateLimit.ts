import { checkRateLimit } from '../utils/rateLimit'

const RATE_LIMITED_PATHS = ['/api/auth/login', '/api/auth/register']
const PIN_ATTEMPT_PATHS = ['/api/settings/pin/verify', '/api/settings/pin/reset']

export default defineEventHandler((event) => {
  if (PIN_ATTEMPT_PATHS.includes(event.path)) {
    checkRateLimit(event, `${event.context.userId}:${event.path}`, 10, 5 * 60 * 1000)
    return
  }

  if (!RATE_LIMITED_PATHS.includes(event.path)) return

  const ip = getRequestIP(event, { xForwardedFor: true })

  if (!ip)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  checkRateLimit(event, `${ip}:${event.path}`, 10, 15 * 60 * 1000)
})
