import { detachMember, FAMILY_TX_OPTIONS, getHousehold } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { leaveHouseholdSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const { takeRecords } = await readValidatedBody(event, body => leaveHouseholdSchema.parse(body ?? {}))

  const fresh = await prisma.$transaction(tx => detachMember(tx, household.id, event.context.userId, { takeRecords }), FAMILY_TX_OPTIONS)

  return householdView(fresh.id, event.context.userId)
})
