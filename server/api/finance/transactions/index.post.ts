import { mapTransaction } from '~~/server/utils/mapper'
import { createTransactionSchema } from '~~/shared/schemas/finance'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createTransactionSchema.parse)

  const transaction = await prisma.transaction.create({
    data: { ...body, userId }
  })

  return mapTransaction(transaction)
})
