import { orNotFound } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { normalizeTags } from '~~/server/utils/mapper'
import { updateTaskSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTaskSchema.parse)
  const { tagIds: rawTagIds, done, dueDate, ...taskData } = body

  if (rawTagIds !== undefined) {
    const uniqueTagIds = [...new Set(rawTagIds)]
    const household = await getHousehold(event)
    const count = await prisma.tag.count({ where: { id: { in: uniqueTagIds }, householdId: household.id } })
    if (uniqueTagIds.length !== count) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })
  }

  const task = await orNotFound(
    prisma.task.update({
      where: {
        id,
        userId,
        deletedAt: null
      },
      data: {
        ...taskData,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(done !== undefined && {
          done,
          doneAt: done ? new Date() : null
        }),
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
    'Task not found'
  )

  return normalizeTags(task)
})
