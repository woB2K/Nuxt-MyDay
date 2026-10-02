import { normalizeTags } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const templates = await prisma.taskTemplate.findMany({
    where: {
      userId
    },
    include: {
      tags: { include: { tag: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return templates.map(el => normalizeTags(el))
})
