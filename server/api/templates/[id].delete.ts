export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const id = getRouterParam(event, 'id')

  try {
    await prisma.taskTemplate.delete({
      where: {
        id, userId
      }
    })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      throw createError({ statusCode: 404, message: 'Template not found' })
    }
    throw e
  }
})
