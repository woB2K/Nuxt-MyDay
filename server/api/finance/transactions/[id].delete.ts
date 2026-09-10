import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const transactionId = getRouterParam(event, 'id')

  const transaction = await prisma.transaction.delete({
    where: {
      id: transactionId,
      userId
    }
  })

  return mapAmount(transaction)
})
