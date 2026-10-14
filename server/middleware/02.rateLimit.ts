import { checkRateLimit, clientIp } from '../utils/rateLimit'
import { requestPath } from '../utils/requestPath'

const RATE_LIMITED_PATHS = ['/api/auth/login', '/api/auth/register']

export default defineEventHandler((event) => {
  const path = requestPath(event)

  if (!RATE_LIMITED_PATHS.includes(path)) return

  const ip = clientIp(event)

  if (!ip)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  checkRateLimit(event, `${ip}:${path}`, 10, 15 * 60 * 1000)
})
