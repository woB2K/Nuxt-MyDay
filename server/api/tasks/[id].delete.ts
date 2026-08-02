export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  return await prisma.task.delete({
    where: {
      id,
      userId
    }
  })
})
