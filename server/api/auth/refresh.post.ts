import { hashToken } from '~~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'refreshToken')

  if (!cookie)
    throw createError({ statusCode: 400, message: 'Refresh token not found' })

  const userId = await verifyRefreshToken(cookie)

  const tokenHash = hashToken(cookie)

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash
    }
  })

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw createError({ statusCode: 401, message: 'Invalid refresh token' })
  }

  const accessToken = await signAccessToken(userId)
  const rawRefreshToken = await signRefreshToken(userId)
  const newTokenHash = hashToken(rawRefreshToken)

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.delete({
      where: { id: storedToken.id }
    })

    await tx.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    })
  })

  setCookie(event, 'refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  return {
    accessToken
  }
})
