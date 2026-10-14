import { orConflict } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { updateCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const categoryId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateCategorySchema.parse)

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId: household.id }
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
