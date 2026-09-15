import type { AppSettings } from '~~/prisma/.generated/prisma'
import { comparePassword } from '~~/server/utils/password'

export async function requireSettings(userId: string): Promise<AppSettings> {
  const settings = await prisma.appSettings.findUnique({ where: { userId } })

  if (!settings) throw createError({ statusCode: 404, message: 'Settings not found' })

  return settings
}

export async function assertPin(settings: AppSettings, pin: string): Promise<void> {
  if (!settings.pinEnabled || !settings.pinHash) {
    throw createError({ statusCode: 409, message: 'PIN is not set' })
  }

  if (!await comparePassword(pin, settings.pinHash)) {
    throw createError({ statusCode: 401, message: 'Wrong PIN' })
  }
}

export function clearPin(userId: string) {
  return prisma.appSettings.update({
    where: { userId },
    data: { pinEnabled: false, pinHash: null }
  })
}
