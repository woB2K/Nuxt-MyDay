import { orNotFound } from '~~/server/utils/dbError'
import { mapAmount } from '~~/server/utils/mapper'
import { inTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const transactionId = getRouterParam(event, 'id')

  const transaction = await orNotFound(
    prisma.transaction.update({
      where: {
        id: transactionId,
        userId,
        deletedAt: inTrash()
      },
      data: { deletedAt: null }
    }),
    'Transaction not found'
  )

  return mapAmount(transaction)
})
