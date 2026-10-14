import { getHousehold, requireOwner, transferOwnership } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { memberParamsSchema, updateMemberSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  requireOwner(household)

  const { userId } = await getValidatedRouterParams(event, memberParamsSchema.parse)
  await readValidatedBody(event, updateMemberSchema.parse)

  if (userId === event.context.userId) throw createError({ statusCode: 400, message: 'You are already the owner' })

  await prisma.$transaction(tx => transferOwnership(tx, household.id, event.context.userId, userId))

  return householdView(household.id, event.context.userId)
})
