import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { assertGoal } from '~~/server/utils/savingsGoals'
import { updateSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)
  const savingsId = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSavingsSchema.parse)

  await assertGoal(body.goalId, userId, household)

  if (body.goalId) {
    const opening = await prisma.savingsEntry.count({ where: { id: savingsId, type: 'OPENING' } })
    if (opening > 0) throw createError({ statusCode: 400, message: 'Opening balance cannot belong to a goal' })
  }

  const entry = await orNotFound(
    prisma.savingsEntry.update({
      where: {
        ...savingsScope(userId, household),
        id: savingsId,
        deletedAt: null
      },
      data: body
    }),
    'Savings entry not found'
  )

  return mapAmount(entry)
})
