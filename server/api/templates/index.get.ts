import { normalizeTags } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const templates = await prisma.taskTemplate.findMany({
    where: {
      userId
    },
    include: {
      tags: { include: { tag: true } }
    }
  })

  return templates.map(el => normalizeTags(el))
})
