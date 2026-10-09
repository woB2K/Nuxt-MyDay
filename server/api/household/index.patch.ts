import { getHousehold, requireOwner } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { updateHouseholdSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  requireOwner(household)

  const body = await readValidatedBody(event, updateHouseholdSchema.parse)

  await prisma.household.update({ where: { id: household.id }, data: body })

  return householdView(household.id, household.role)
})
