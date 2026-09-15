import { transactionWhere } from '~~/server/utils/transactionWhere'
import { transactionFilterQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const filters = await getValidatedQuery(event, transactionFilterQuerySchema.parse)

  const where = transactionWhere(userId, filters)

  const withIncome = filters.type !== 'EXPENSE'
  const withExpense = filters.type !== 'INCOME'

  const [incomeAgg, expenseAgg, breakdown] = await Promise.all([
    withIncome
      ? prisma.transaction.aggregate({ where: { ...where, type: 'INCOME' }, _sum: { amount: true } })
      : null,
    withExpense
      ? prisma.transaction.aggregate({ where: { ...where, type: 'EXPENSE' }, _sum: { amount: true } })
      : null,
    withExpense
      ? prisma.transaction.groupBy({
          by: ['categoryId'],
          where: { ...where, type: 'EXPENSE' },
          _sum: { amount: true },
          orderBy: {
            _sum: { amount: 'desc' }
          }
        })
      : []
  ])

  const categoryIds = breakdown.map(b => b.categoryId)
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
      userId
    }
  })

  const income = incomeAgg?._sum.amount?.toNumber() ?? 0
  const expense = expenseAgg?._sum.amount?.toNumber() ?? 0

  return {
    income,
    expense,
    networth: income - expense,
    breakdown: breakdown.map((b) => {
      const cat = categories.find(c => c.id === b.categoryId)
      return {
        total: b._sum.amount?.toNumber() ?? 0,
        category: {
          id: cat?.id ?? '',
          name: cat?.name ?? '',
          key: cat?.key ?? null,
          icon: cat?.icon ?? '',
          color: cat?.color ?? ''
        }
      }
    })
  }
})
