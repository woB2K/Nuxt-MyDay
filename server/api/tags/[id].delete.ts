export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const tagId = getRouterParam(event, 'id')

  return await prisma.tag.delete({
    where: {
      id: tagId,
      userId
    }
  })
})
