import { createTagSchema } from '~~/shared/schemas/tag'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createTagSchema.parse)

  try {
    return await prisma.tag.create({
      data: { ...body, userId }
    })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Tag already exists' })
    }
    throw e
  }
})
