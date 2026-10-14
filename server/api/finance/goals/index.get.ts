import { getHousehold, goalScope, savingsScope } from '~~/server/utils/household'
import { withSaved } from '~~/server/utils/savingsGoals'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const goals = await prisma.savingsGoal.findMany({
    where: goalScope(userId, household),
    orderBy: { createdAt: 'asc' }
  })

  return withSaved(goals, savingsScope(userId, household))
})
