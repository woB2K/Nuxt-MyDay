import type { Prisma } from '~~/prisma/.generated/prisma'
import { normalizeTask } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const query = getQuery(event)

  const filter = query.filter
  const search = query.search

  const doneByFilter: Record<string, boolean | undefined> = {
    open: false,
    done: true,
    all: undefined
  }

  const where: Prisma.TaskWhereInput = { userId }

  where.done = doneByFilter[String(filter)]

  if (search) where.title = { contains: String(search), mode: 'insensitive' }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      tags: {
        include: { tag: true }
      }
    }
  })

  return tasks.map(el => normalizeTask(el))
})
