import { toPublicSettings } from '~~/server/utils/mapper'
import { assertPin, clearPin, requireSettings } from '~~/server/utils/pin'
import { pinAttemptSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { pin } = await readValidatedBody(event, pinAttemptSchema.parse)
  const settings = await requireSettings(userId)

  await assertPin(settings, pin)

  return toPublicSettings(await clearPin(userId))
})
