import { detachMember, getHousehold } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const fresh = await prisma.$transaction(tx => detachMember(tx, household.id, event.context.userId))

  return householdView(fresh.id, 'OWNER')
})
