import { updateTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const tagId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTagSchema.parse)

  try {
    return await prisma.tag.update({
      where: {
        id: tagId,
        userId
      },
      data: { ...body }
    })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Tag already exists' })
    }
    throw e
  }
})
