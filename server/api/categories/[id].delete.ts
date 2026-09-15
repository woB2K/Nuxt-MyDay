import { systemCategoryKeys } from '~~/prisma/seeds/categories'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const categoryId = getRouterParam(event, 'id')

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  if (category.isSystem) {
    throw createError({ statusCode: 400, message: 'System category cannot be deleted' })
  }

  const fallback = await prisma.category.findFirst({
    where: { userId, type: category.type, key: systemCategoryKeys[category.type] }
  })

  if (!fallback) {
    throw createError({ statusCode: 409, message: 'Fallback category is missing' })
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { userId, categoryId: category.id },
      data: { categoryId: fallback.id }
    }),
    prisma.budget.deleteMany({
      where: { userId, categoryId: category.id }
    }),
    prisma.category.delete({
      where: { id: category.id }
    })
  ])

  return category
})
