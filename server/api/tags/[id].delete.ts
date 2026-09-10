import { orNotFound } from '~~/server/utils/dbError'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const tagId = getRouterParam(event, 'id')

  return await orNotFound(
    prisma.tag.delete({
      where: {
        id: tagId,
        userId
      }
    }),
    'Tag not found'
  )
})
