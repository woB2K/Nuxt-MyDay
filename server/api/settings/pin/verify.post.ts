import { assertPin, requireSettings } from '~~/server/utils/pin'
import { pinAttemptSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { pin } = await readValidatedBody(event, pinAttemptSchema.parse)

  await assertPin(await requireSettings(userId), pin)

  return { ok: true }
})
