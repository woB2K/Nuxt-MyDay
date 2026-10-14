import { systemCategoryKeys } from '~~/prisma/seeds/categories'
import { getHousehold } from '~~/server/utils/household'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const categoryId = getRouterParam(event, 'id')

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId: household.id }
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  if (category.isSystem) {
    throw createError({ statusCode: 400, message: 'System category cannot be deleted' })
  }

  const fallback = await prisma.category.findFirst({
    where: { householdId: household.id, type: category.type, key: systemCategoryKeys[category.type] }
  })

  if (!fallback) {
    throw createError({ statusCode: 409, message: 'Fallback category is missing' })
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { householdId: household.id, categoryId: category.id },
      data: { categoryId: fallback.id }
    }),
    prisma.budget.deleteMany({
      where: { householdId: household.id, categoryId: category.id }
    }),
    prisma.category.delete({
      where: { id: category.id }
    })
  ])

  return category
})
