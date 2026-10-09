import { detachMember, getHousehold, requireOwner } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { memberParamsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  requireOwner(household)

  const { userId } = await getValidatedRouterParams(event, memberParamsSchema.parse)

  if (userId === event.context.userId) throw createError({ statusCode: 400, message: 'Use leave to exit the family' })

  await prisma.$transaction(tx => detachMember(tx, household.id, userId, event.context.userId))

  return householdView(household.id, household.role)
})
