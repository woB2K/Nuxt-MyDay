import { orNotFound } from '~~/server/utils/dbError'
import { normalizeTags } from '~~/server/utils/mapper'
import { updateTemplateSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTemplateSchema.parse)

  const { tagIds: rawTagIds, ...templateData } = body

  if (rawTagIds !== undefined) {
    const uniqueTagIds = [...new Set(rawTagIds)]
    const count = await prisma.tag.count({ where: { id: { in: uniqueTagIds }, userId } })
    if (uniqueTagIds.length !== count) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })
  }

  const template = await orNotFound(
    prisma.taskTemplate.update({
      where: {
        id,
        userId
      },
      data: {
        ...templateData,
        ...(rawTagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: [...new Set(rawTagIds)].map(tagId => ({ tagId }))
          }
        })
      },
      include: {
        tags: { include: { tag: true } }
      }
    }),
    'Template not found'
  )

  return normalizeTags(template)
})
