import { hashToken } from '~~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'refreshToken')

  if (!cookie) {
    throw createError({ statusCode: 400, message: 'Refresh token not found' })
  }

  const tokenHash = hashToken(cookie)

  await prisma.refreshToken.deleteMany({
    where: {
      tokenHash
    }
  })

  deleteCookie(event, 'refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  })

  return {
    message: 'Logged out successfully'
  }
})
