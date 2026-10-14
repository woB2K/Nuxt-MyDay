import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { updateSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)
  const savingsId = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSavingsSchema.parse)

  const entry = await orNotFound(
    prisma.savingsEntry.update({
      where: {
        id: savingsId,
        ...savingsScope(userId, household),
        deletedAt: null
      },
      data: body
    }),
    'Savings entry not found'
  )

  return mapAmount(entry)
})
