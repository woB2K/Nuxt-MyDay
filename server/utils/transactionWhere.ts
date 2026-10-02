import type { Prisma } from '~~/prisma/.generated/prisma'
import type { TransactionFilterQuery } from '~~/shared/schemas'

export function transactionWhere(userId: string, filters: TransactionFilterQuery): Prisma.TransactionWhereInput {
  const { type, from, to, search, categoryIds } = filters

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

  return where
}
