import { hashToken } from '~~/server/utils/jwt'
import { toPublicUser } from '~~/server/utils/mapper'
import { loginSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = loginSchema.parse(await readBody(event))

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { settings: true }
  })

  if (!user)
    throw createError({ statusCode: 401, message: 'Invalid Client Credentials' })

  if (!user.settings)
    throw createError({ statusCode: 500, message: 'User settings not found' })

  if (!user.passwordHash)
    throw createError({ statusCode: 401, message: 'Invalid Client Credentials' })

  const isCorrectPassword = await comparePassword(body.password, user.passwordHash)

  if (!isCorrectPassword)
    throw createError({ statusCode: 401, message: 'Invalid Client Credentials' })

  const accessToken = await signAccessToken(user.id)
  const rawRefreshToken = await signRefreshToken(user.id)
  const tokenHash = hashToken(rawRefreshToken)

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  })

  setCookie(event, 'refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  return {
    user: toPublicUser(user),
    accessToken
  }
})
