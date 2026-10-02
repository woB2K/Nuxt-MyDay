import { orNotFound } from '~~/server/utils/dbError'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const id = getRouterParam(event, 'id')

  await orNotFound(
    prisma.taskTemplate.delete({
      where: {
        id, userId
      }
    }),
    'Template not found'
  )
})
