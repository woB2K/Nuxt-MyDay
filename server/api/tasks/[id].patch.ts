import { orNotFound } from '~~/server/utils/dbError'
import { normalizeTags } from '~~/server/utils/mapper'
import { updateTaskSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateTaskSchema.parse)
  const { tagIds: rawTagIds, done, ...taskData } = body

  if (rawTagIds !== undefined) {
    const uniqueTagIds = [...new Set(rawTagIds)]
    const count = await prisma.tag.count({ where: { id: { in: uniqueTagIds }, userId } })
    if (uniqueTagIds.length !== count) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })
  }

  const task = await orNotFound(
    prisma.task.update({
      where: {
        id,
        userId
      },
      data: {
        ...taskData,
        ...(done !== undefined && {
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
