export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const query = getQuery(event)
  const from = query.from ? new Date(query.from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const to = query.to ? new Date(query.to as string) : new Date()

  const [incomeAgg, expenseAgg, breakdown] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: from, lte: to } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: from, lte: to } },
      _sum: { amount: true }
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: from, lte: to } },
      _sum: { amount: true },
      orderBy: {
        _sum: { amount: 'desc' }
      }
    })
  ])

  const categoryIds = breakdown.map(b => b.categoryId)
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds }
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
        categoryId: b.categoryId,
        categoryName: cat?.name,
        categoryIcon: cat?.icon,
        type: cat?.type,
        color: cat?.color,
        total: b._sum.amount?.toNumber() ?? 0
      }
    })
  }
})
