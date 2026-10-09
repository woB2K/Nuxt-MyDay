import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { inTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const transactionId = getRouterParam(event, 'id')

  const transaction = await orNotFound(
    prisma.transaction.update({
      where: {
        id: transactionId,
        householdId: household.id,
        deletedAt: inTrash()
      },
      data: { deletedAt: null }
    }),
    'Transaction not found'
  )

  return mapAmount(transaction)
})
