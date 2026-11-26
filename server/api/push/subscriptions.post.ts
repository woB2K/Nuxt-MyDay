import { pushSubscriptionSchema } from '~~/shared/schemas'

const MAX_USER_AGENT_LENGTH = 256

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { endpoint, keys } = await readValidatedBody(event, pushSubscriptionSchema.parse)

  const data = {
    userId,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: getRequestHeader(event, 'user-agent')?.slice(0, MAX_USER_AGENT_LENGTH) ?? null
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, ...data },
    update: data
  })

  return { ok: true }
})
