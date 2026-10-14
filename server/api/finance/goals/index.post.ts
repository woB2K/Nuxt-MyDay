import { getHousehold } from '~~/server/utils/household'
import { savedGoal } from '~~/server/utils/savingsGoals'
import { createSavingsGoalSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)
  const { deadline, ...body } = await readValidatedBody(event, createSavingsGoalSchema.parse)

  const goal = await prisma.savingsGoal.create({
    data: { ...body, deadline: deadline ? new Date(deadline) : null, householdId: household.id, userId }
  })

  return savedGoal(goal, userId, household)
})
