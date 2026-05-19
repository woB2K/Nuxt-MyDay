import { checkRateLimit } from '../utils/rateLimit'

const RATE_LIMITED_PATHS = ['/api/auth/login', '/api/auth/register']

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true })

  if (!ip)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  if (RATE_LIMITED_PATHS.includes(event.path)) checkRateLimit(event, `${ip}:${event.path}`, 10, 15 * 60 * 1000)
})
