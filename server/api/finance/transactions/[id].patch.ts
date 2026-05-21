import { mapTransaction } from '~~/server/utils/mapper'
import { updateTransactionSchema } from '~~/shared/schemas/finance'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const transactionId = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateTransactionSchema.parse)

  const transaction = await prisma.transaction.update({
    where: {
      id: transactionId,
      userId
    },
    data: { ...body }
  })

  return mapTransaction(transaction)
})
