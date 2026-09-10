import { orNotFound } from '~~/server/utils/dbError'
import { updateCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const categoryId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateCategorySchema.parse)

  return orNotFound(
    prisma.category.update({
      where: {
        id: categoryId,
        userId
      },
      data: { ...body }
    }),
    'Category not found'
  )
})
