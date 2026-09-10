import { orNotFound } from '~~/server/utils/dbError'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const categoryId = getRouterParam(event, 'id')

  return orNotFound(
    prisma.category.delete({
      where: {
        id: categoryId,
        userId
      }
    }),
    'Category not found'
  )
})
