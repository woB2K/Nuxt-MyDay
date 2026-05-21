export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const savingsId = getRouterParam(event, 'id')

  return prisma.savingsEntry.delete({
    where: {
      id: savingsId,
      userId
    }
  })
})
