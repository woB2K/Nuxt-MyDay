import { orConflict, orNotFound } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { updateTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const tagId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTagSchema.parse)

  return await orConflict(
    orNotFound(
      prisma.tag.update({
        where: {
          id: tagId,
          householdId: household.id
        },
        data: { ...body }
      }),
      'Tag not found'
    ),
    'Tag already exists'
  )
})
