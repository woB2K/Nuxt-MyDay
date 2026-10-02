import type { PinStatus } from '~~/shared/types'
import { requireSettings } from '~~/server/utils/pin'

export default defineEventHandler(async (event): Promise<PinStatus> => {
  const userId = event.context.userId

  const [settings, user] = await Promise.all([
    requireSettings(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  ])

  return {
    enabled: settings.pinEnabled,
    resetVia: user?.passwordHash ? 'password' : 'oauth'
  }
})
