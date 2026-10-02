import { orNotFound } from '~~/server/utils/dbError'
import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const savingsId = getRouterParam(event, 'id')

  const entry = await orNotFound(
    prisma.savingsEntry.delete({
      where: {
        id: savingsId,
        userId
      }
    }),
    'Savings entry not found'
  )

  return mapAmount(entry)
})
