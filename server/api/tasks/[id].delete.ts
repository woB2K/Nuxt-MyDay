import { orNotFound } from '~~/server/utils/dbError'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  return await orNotFound(
    prisma.task.delete({
      where: {
        id,
        userId
      }
    }),
    'Task not found'
  )
})
