import { orNotFound } from '~~/server/utils/dbError'
import { normalizeTags } from '~~/server/utils/mapper'
import { inTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const task = await orNotFound(
    prisma.task.update({
      where: {
        id,
        userId,
        deletedAt: inTrash()
      },
      data: { deletedAt: null },
      include: {
        tags: { include: { tag: true } }
      }
    }),
    'Task not found'
  )

  return normalizeTags(task)
})
