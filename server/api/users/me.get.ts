import { toPublicUser } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return toPublicUser(user)
})
