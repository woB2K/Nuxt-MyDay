import type { Prisma } from '~~/prisma/.generated/prisma'
import { dateRangeQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { from, to } = await getValidatedQuery(event, dateRangeQuerySchema.parse)

  const where: Prisma.TransactionWhereInput = { userId }

  if (from || to) {
    where.date = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) })
    }
  }

  const [incomeAgg, expenseAgg, breakdown] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true }
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      orderBy: {
        _sum: { amount: 'desc' }
      }
    })
  ])

  const categoryIds = breakdown.map(b => b.categoryId)
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
      userId
    }
  })

  const networth = (incomeAgg._sum.amount?.toNumber() ?? 0) - (expenseAgg._sum.amount?.toNumber() ?? 0)

  return {
    income: incomeAgg._sum.amount?.toNumber() ?? 0,
    expense: expenseAgg._sum.amount?.toNumber() ?? 0,
    networth,
    breakdown: breakdown.map((b) => {
      const cat = categories.find(c => c.id === b.categoryId)
      return {
        total: b._sum.amount?.toNumber() ?? 0,
        category: {
          id: cat?.id ?? '',
          name: cat?.name ?? '',
          icon: cat?.icon ?? '',
          color: cat?.color ?? ''
        }
      }
    })
  }
})
