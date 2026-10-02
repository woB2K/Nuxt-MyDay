import { orNotFound } from '~~/server/utils/dbError'
import { toPublicSettings } from '~~/server/utils/mapper'
import { updateSettingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, updateSettingsSchema.parse)

  const settings = await orNotFound(
    prisma.appSettings.update({
      where: { userId },
      data: { ...body }
    }),
    'Settings not found'
  )

  return toPublicSettings(settings)
})
