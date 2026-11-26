import type { PushTestResult } from '~~/shared/types'
import { pushMessage, toPushLang } from '~~/server/utils/notifications/messages'
import { deliver } from '~~/server/utils/notifications/tick'
import { pushSender } from '~~/server/utils/push'

const TEST_PUSH_LIMIT = 5
const TEST_PUSH_WINDOW_MS = 10 * 60 * 1000

export default defineEventHandler(async (event): Promise<PushTestResult> => {
  const userId = event.context.userId

  checkRateLimit(event, `push-test:${userId}`, TEST_PUSH_LIMIT, TEST_PUSH_WINDOW_MS)

  const send = pushSender()

  if (!send) throw createError({ statusCode: 503, message: 'Push is not configured' })

  const settings = await prisma.appSettings.findUnique({ where: { userId }, select: { lang: true } })

  const sent = await deliver(prisma, send, userId, pushMessage({ kind: 'test' }, toPushLang(settings?.lang ?? 'en'), false))

  return { sent }
})
