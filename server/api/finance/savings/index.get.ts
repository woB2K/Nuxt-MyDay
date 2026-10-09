import type { Prisma } from '~~/prisma/.generated/prisma'
import { timestampRange } from '~~/server/utils/dateRange'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { savingsQuerySchema } from '~~/shared/schemas'

type SumRows = Array<{ type: string, _sum: { amount: Prisma.Decimal | null } }>

function sumOf(rows: SumRows, type: string): number | null {
  return rows.find(row => row.type === type)?._sum.amount?.toNumber() ?? null
}

function net(rows: SumRows): number {
  return (sumOf(rows, 'DEPOSIT') ?? 0) - (sumOf(rows, 'WITHDRAWAL') ?? 0)
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const scope = savingsScope(userId, await getHousehold(event))

  const { from, to, page, limit } = await getValidatedQuery(event, savingsQuerySchema.parse)

  const createdAt = timestampRange(from, to)
  const where: Prisma.SavingsEntryWhereInput = { ...scope, deletedAt: null, ...(createdAt && { createdAt }) }

  const [allTime, inPeriod, entries, total] = await Promise.all([
    prisma.savingsEntry.groupBy({
      by: ['type'],
      where: { ...scope, deletedAt: null },
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

  const opening = sumOf(allTime, 'OPENING')

  return {
    balance: (opening ?? 0) + net(allTime),
    delta: net(inPeriod ?? allTime),
    opening,
    entries: entries.map(e => mapAmount(e)),
    total,
    page,
    limit
  }
})
