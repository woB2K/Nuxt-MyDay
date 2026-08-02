import { seedCategories } from '~~/prisma/seeds/categories'
import { hashToken } from '~~/server/utils/jwt'
import { toPublicUser } from '~~/server/utils/mapper'
import { registerSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = registerSchema.parse(await readBody(event))

  const isExistUser = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (isExistUser) {
    throw createError({ statusCode: 400, message: 'User with this email already exists' })
  }

  const hashedPassword = await hashPassword(body.password)

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: hashedPassword
      }
    })
    await seedCategories(tx, newUser.id)
    const appSettings = await tx.appSettings.create({
      data: {
        userId: newUser.id
      }
    })

    const accessToken = await signAccessToken(newUser.id)
    const rawRefreshToken = await signRefreshToken(newUser.id)
    const tokenHash = hashToken(rawRefreshToken)

    setCookie(event, 'refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    await tx.refreshToken.create({
      data: {
        tokenHash,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    })

    return {
      user: toPublicUser({
        ...newUser,
        settings: appSettings
      }),
      accessToken
    }
  })

  return result
})
