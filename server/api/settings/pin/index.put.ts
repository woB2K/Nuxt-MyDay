import { toPublicSettings } from '~~/server/utils/mapper'
import { hashPassword } from '~~/server/utils/password'
import { assertPin, requireSettings } from '~~/server/utils/pin'
import { setPinSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { pin, currentPin } = await readValidatedBody(event, setPinSchema.parse)
  const settings = await requireSettings(userId)

  if (settings.pinEnabled) {
    if (!currentPin) throw createError({ statusCode: 400, message: 'Current PIN is required' })

    await assertPin(event, settings, currentPin)
  }

  const updated = await prisma.appSettings.update({
    where: { userId },
    data: { pinEnabled: true, pinHash: await hashPassword(pin) }
  })

  return toPublicSettings(updated)
})
