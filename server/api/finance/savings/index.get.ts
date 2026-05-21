import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 20)
  const skip = (page - 1) * limit

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [allTime, thisMonthByType, entries] = await Promise.all([
    prisma.savingsEntry.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true }
    }),
    prisma.savingsEntry.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: monthStart } },
      _sum: { amount: true }
    }),
    prisma.savingsEntry.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  ])

  const dep = allTime.find(r => r.type === 'DEPOSIT')?._sum.amount?.toNumber() ?? 0
  const wit = allTime.find(r => r.type === 'WITHDRAWAL')?._sum.amount?.toNumber() ?? 0
  const balance = dep - wit

  const thisMonthDep = thisMonthByType.find(r => r.type === 'DEPOSIT')?._sum.amount?.toNumber() ?? 0
  const thisMonthWit = thisMonthByType.find(r => r.type === 'WITHDRAWAL')?._sum.amount?.toNumber() ?? 0

  return {
    balance,
    thisMonth: thisMonthDep - thisMonthWit,
    entries: entries.map(e => mapAmount(e))
  }
})
