import { mapAmount } from '~~/server/utils/mapper'
import { transactionWhere } from '~~/server/utils/transactionWhere'
import { transactionQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { page, limit, ...filters } = await getValidatedQuery(event, transactionQuerySchema.parse)

  const where = transactionWhere(userId, filters)

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.transaction.count({ where })
  ])

  return {
    data: items.map(i => mapAmount(i)),
    total,
    page,
    limit
  }
})
