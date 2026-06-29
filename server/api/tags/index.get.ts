export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  return prisma.tag.findMany({
    where: { userId },
    orderBy: {
      name: 'asc'
    }
  })
})
