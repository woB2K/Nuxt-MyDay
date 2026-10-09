import { getHousehold } from '~~/server/utils/household'
import { normalizeTags } from '~~/server/utils/mapper'
import { createTaskSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const body = await readValidatedBody(event, createTaskSchema.parse)

  const tagIds = [...new Set(body.tagIds)]

  const userTagIds = await prisma.tag.count({
    where: {
      id: { in: tagIds },
      householdId: household.id
    }
  })

  if (tagIds.length !== userTagIds) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })

  const { tagIds: _, dueDate, ...taskData } = body

  const task = await prisma.task.create({
    data: {
      ...taskData, userId,
      ...(dueDate && { dueDate: new Date(dueDate) }),
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

  return normalizeTags(task)
})
