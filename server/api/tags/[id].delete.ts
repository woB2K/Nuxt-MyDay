import { orNotFound } from '~~/server/utils/dbError'

import { getHousehold } from '~~/server/utils/household'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const tagId = getRouterParam(event, 'id')

  return await orNotFound(
    prisma.tag.delete({
      where: {
        id: tagId,
        householdId: household.id
      }
    }),
    'Tag not found'
  )
})
