import { getHousehold, requireOwner } from '~~/server/utils/household'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  requireOwner(household)

  const { count } = await prisma.householdInvite.deleteMany({ where: { householdId: household.id } })

  return { deleted: count }
})
