import { orConflict, orNotFound } from '~~/server/utils/dbError'
import { updateTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const tagId = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTagSchema.parse)

  return await orConflict(
    orNotFound(
      prisma.tag.update({
        where: {
          id: tagId,
          userId
        },
        data: { ...body }
      }),
      'Tag not found'
    ),
    'Tag already exists'
  )
})
