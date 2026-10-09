import { orNotFound } from '~~/server/utils/dbError'
import { mapAmount } from '~~/server/utils/mapper'
import { updateSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const savingsId = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSavingsSchema.parse)

  const entry = await orNotFound(
    prisma.savingsEntry.update({
      where: {
        id: savingsId,
        userId,
        deletedAt: null
      },
      data: body
    }),
    'Savings entry not found'
  )

  return mapAmount(entry)
})
