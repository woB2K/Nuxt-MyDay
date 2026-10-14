import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const savingsId = getRouterParam(event, 'id')

  const entry = await orNotFound(
    prisma.savingsEntry.update({
      where: {
        id: savingsId,
        ...savingsScope(userId, household),
        deletedAt: null
      },
      data: { deletedAt: new Date() }
    }),
    'Savings entry not found'
  )

  return mapAmount(entry)
})
