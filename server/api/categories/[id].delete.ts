export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const categoryId = getRouterParam(event, 'id')

  return prisma.category.delete({
    where: {
      id: categoryId,
      userId
    }
  })
})
