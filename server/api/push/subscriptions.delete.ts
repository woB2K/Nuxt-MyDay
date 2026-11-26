import { pushUnsubscribeSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { endpoint } = await readValidatedBody(event, pushUnsubscribeSchema.parse)

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } })

  return { ok: true }
})
