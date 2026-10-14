import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { toTransactionItem, transactionTags } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const transactionId = getRouterParam(event, 'id')

  const transaction = await orNotFound(
    prisma.transaction.update({
      where: {
        id: transactionId,
        householdId: household.id,
        deletedAt: null
      },
      data: { deletedAt: new Date() },
      include: transactionTags
    }),
    'Transaction not found'
  )

  return toTransactionItem(transaction)
})
