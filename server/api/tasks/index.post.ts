import { normalizeTask } from '~~/server/utils/mapper'
import { createTaskSchema } from '~~/shared/schemas/task'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createTaskSchema.parse)

  const tagIds = [...new Set(body.tagIds)]

  const userTagIds = await prisma.tag.count({
    where: {
      id: { in: tagIds },
      userId
    }
  })

  if (tagIds.length !== userTagIds) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })

  const { tagIds: _, ...taskData } = body

  const task = await prisma.task.create({
    data: {
      ...taskData, userId,
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

  return normalizeTask(task)
})
