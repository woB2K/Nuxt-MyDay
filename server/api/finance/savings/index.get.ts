import type { Prisma } from '~~/prisma/.generated/prisma'
import { timestampRange } from '~~/server/utils/dateRange'
import { mapAmount } from '~~/server/utils/mapper'
import { savingsQuerySchema } from '~~/shared/schemas'

function net(rows: Array<{ type: string, _sum: { amount: Prisma.Decimal | null } }>): number {
  const sum = (type: string) => rows.find(row => row.type === type)?._sum.amount?.toNumber() ?? 0

  return sum('DEPOSIT') - sum('WITHDRAWAL')
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { from, to, page, limit } = await getValidatedQuery(event, savingsQuerySchema.parse)

  const createdAt = timestampRange(from, to)
  const where: Prisma.SavingsEntryWhereInput = { userId, ...(createdAt && { createdAt }) }

  const [allTime, inPeriod, entries, total] = await Promise.all([
    prisma.savingsEntry.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true }
    }),
    createdAt
      ? prisma.savingsEntry.groupBy({
          by: ['type'],
          where,
          _sum: { amount: true }
        })
      : null,
    prisma.savingsEntry.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.savingsEntry.count({ where })
  ])

  const balance = net(allTime)

  return {
    balance,
    delta: inPeriod ? net(inPeriod) : balance,
    entries: entries.map(e => mapAmount(e)),
    total,
    page,
    limit
  }
})
