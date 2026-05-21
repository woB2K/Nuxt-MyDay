import { mapTransaction } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const query = getQuery(event)

  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 20)
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId
      },
      skip,
      take: limit,
      orderBy: { date: 'desc' }
    }),
    prisma.transaction.count({ where: { userId } })
  ])

  return {
    data: items.map(i => mapTransaction(i)),
    total,
    page,
    limit
  }
})
