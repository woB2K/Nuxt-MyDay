import type { Prisma } from '~~/prisma/.generated/prisma'
import { mapAmount } from '~~/server/utils/mapper'
import { transactionQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { type, from, to, search, categoryIds, page, limit } = await getValidatedQuery(
    event,
    transactionQuerySchema.parse
  )

  const where: Prisma.TransactionWhereInput = { userId }

  if (type) where.type = type

  if (from || to) {
    where.date = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) })
    }
  }

  if (categoryIds?.length) where.categoryId = { in: categoryIds }

  if (search) where.notes = { contains: search, mode: 'insensitive' }

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
