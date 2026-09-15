import { orConflict } from '~~/server/utils/dbError'
import { updateCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const categoryId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateCategorySchema.parse)

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  if (category.isSystem && body.type && body.type !== category.type) {
    throw createError({ statusCode: 400, message: 'System category cannot change type' })
  }

  const renamed = body.name !== undefined && body.name !== category.name

  return orConflict(
    prisma.category.update({
      where: { id: category.id },
      data: { ...body, ...(renamed && { key: null }) }
    }),
    'Category already exists'
  )
})
