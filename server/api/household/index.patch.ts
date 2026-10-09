import { getHousehold, lockMembership } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { updateHouseholdSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const body = await readValidatedBody(event, updateHouseholdSchema.parse)

  await prisma.$transaction(async (tx) => {
    await lockMembership(tx, household.id, event.context.userId, { owner: true })
    await tx.household.update({ where: { id: household.id }, data: body })
  })

  return householdView(household.id, household.role)
})
