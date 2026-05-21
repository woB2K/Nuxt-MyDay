export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' }
  })
})
