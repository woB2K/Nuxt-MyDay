import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold, goalScope } from '~~/server/utils/household'
import { savedGoal } from '~~/server/utils/savingsGoals'
import { updateSavingsGoalSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)
  const goalId = getRouterParam(event, 'id')
  const { deadline, ...body } = await readValidatedBody(event, updateSavingsGoalSchema.parse)

  const goal = await orNotFound(
    prisma.savingsGoal.update({
      where: { id: goalId, ...goalScope(userId, household) },
      data: { ...body, ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }) }
    }),
    'Goal not found'
  )

  return savedGoal(goal, userId, household)
})
