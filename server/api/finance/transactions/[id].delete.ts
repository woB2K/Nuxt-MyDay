export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const transactionId = getRouterParam(event, 'id')

  return prisma.transaction.delete({
    where: {
      id: transactionId,
      userId
    }
  })
})
