import type { H3Event } from 'h3'
import type { AppSettings } from '~~/prisma/.generated/prisma'
import { comparePassword } from '~~/server/utils/password'
import { checkRateLimit } from '~~/server/utils/rateLimit'

const MAX_ATTEMPTS = 10
const ATTEMPT_WINDOW = 5 * 60 * 1000

export function countFailedSecret(event: H3Event, userId: string): void {
  checkRateLimit(event, `${userId}:secret`, MAX_ATTEMPTS, ATTEMPT_WINDOW)
}

export async function requireSettings(userId: string): Promise<AppSettings> {
  const settings = await prisma.appSettings.findUnique({ where: { userId } })

  if (!settings) throw createError({ statusCode: 404, message: 'Settings not found' })

  return settings
}

export async function assertPin(event: H3Event, settings: AppSettings, pin: string): Promise<void> {
  if (!settings.pinEnabled || !settings.pinHash) {
    throw createError({ statusCode: 409, message: 'PIN is not set' })
  }

  if (!await comparePassword(pin, settings.pinHash)) {
    countFailedSecret(event, settings.userId)

    throw createError({ statusCode: 403, message: 'Wrong PIN' })
  }
}

export function clearPin(userId: string) {
  return prisma.appSettings.update({
    where: { userId },
    data: { pinEnabled: false, pinHash: null }
  })
}
