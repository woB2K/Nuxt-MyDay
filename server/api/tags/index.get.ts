import { getHousehold } from '~~/server/utils/household'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  return prisma.tag.findMany({
    where: { householdId: household.id },
    orderBy: {
      name: 'asc'
    }
  })
})
