import { getHousehold } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  return householdView(household.id, household.role)
})
