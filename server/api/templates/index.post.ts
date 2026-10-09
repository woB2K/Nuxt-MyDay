import { normalizeTags } from '~~/server/utils/mapper'
import { createTemplateSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createTemplateSchema.parse)

  const tagIds = [...new Set(body.tagIds)]

  const userTagIds = await prisma.tag.count({
    where: {
      id: { in: tagIds },
      userId
    }
  })

  if (tagIds.length !== userTagIds) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })

  const { tagIds: _, ...templateData } = body

  const template = await prisma.taskTemplate.create({
    data: {
      ...templateData, userId,
      tags: {
        create: tagIds.map(tagId => ({ tagId }))
      }
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  return normalizeTags(template)
})
