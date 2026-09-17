import { toPublicSettings } from '~~/server/utils/mapper'
import { comparePassword } from '~~/server/utils/password'
import { clearPin, countFailedSecret } from '~~/server/utils/pin'
import { resetPinSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { password } = await readValidatedBody(event, resetPinSchema.parse)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true }
  })

  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  if (!user.passwordHash) {
    throw createError({ statusCode: 409, message: 'Account has no password, re-authenticate with the provider' })
  }

  if (!await comparePassword(password, user.passwordHash)) {
    countFailedSecret(event, userId)

    throw createError({ statusCode: 403, message: 'Wrong password' })
  }

  return toPublicSettings(await clearPin(userId))
})
