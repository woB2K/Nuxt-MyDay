import { seedCategories } from '~~/prisma/seeds/categories'
import { setRefreshCookie } from '~~/server/utils/authCookie'
import { orConflict } from '~~/server/utils/dbError'
import { hashToken } from '~~/server/utils/jwt'
import { toPublicUser } from '~~/server/utils/mapper'
import { registerSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  const hashedPassword = await hashPassword(body.password)

  return await orConflict(prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: hashedPassword
      }
    })
    const household = await tx.household.create({
      data: { members: { create: { userId: newUser.id, role: 'OWNER' } } }
    })
    await seedCategories(tx, household.id)
    const appSettings = await tx.appSettings.create({
      data: {
        userId: newUser.id
      }
    })

    const accessToken = await signAccessToken(newUser.id)
    const rawRefreshToken = await signRefreshToken(newUser.id)
    const tokenHash = hashToken(rawRefreshToken)

    setRefreshCookie(event, rawRefreshToken)

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
  }), 'User with this email already exists')
})
