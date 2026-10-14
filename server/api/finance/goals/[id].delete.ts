import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold, goalScope } from '~~/server/utils/household'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const goalId = getRouterParam(event, 'id')

  return orNotFound(
    prisma.savingsGoal.delete({ where: { ...goalScope(event.context.userId, household), id: goalId } }),
    'Goal not found'
  )
})
