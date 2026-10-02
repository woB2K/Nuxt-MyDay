import { orNotFound } from '~~/server/utils/dbError'
import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const transactionId = getRouterParam(event, 'id')

  const transaction = await orNotFound(
    prisma.transaction.delete({
      where: {
        id: transactionId,
        userId
      }
    }),
    'Transaction not found'
  )

  return mapAmount(transaction)
})
