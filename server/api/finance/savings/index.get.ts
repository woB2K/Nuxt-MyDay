import type { Prisma } from '~~/prisma/.generated/prisma'
import type { SavingsSumRow } from '~~/server/utils/savingsBalance'
import { timestampRange } from '~~/server/utils/dateRange'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { roundMoney, savingsBalanceOf, sumOfType } from '~~/server/utils/savingsBalance'
import { savingsQuerySchema } from '~~/shared/schemas'

function net(rows: SavingsSumRow[]): number {
  return roundMoney((sumOfType(rows, 'DEPOSIT') ?? 0) - (sumOfType(rows, 'WITHDRAWAL') ?? 0))
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const scope = savingsScope(userId, await getHousehold(event))

  const { from, to, page, limit } = await getValidatedQuery(event, savingsQuerySchema.parse)

  const createdAt = timestampRange(from, to)
  const where: Prisma.SavingsEntryWhereInput = { ...scope, deletedAt: null, ...(createdAt && { createdAt }) }

  const [allTime, inPeriod, entries, total] = await Promise.all([
    prisma.savingsEntry.groupBy({
      by: ['userId', 'type'],
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

  return {
    balance: savingsBalanceOf(allTime),
    own: savingsBalanceOf(allTime.filter(row => row.userId === userId)),
    delta: net(inPeriod ?? allTime),
    opening: sumOfType(allTime, 'OPENING'),
    entries: entries.map(e => mapAmount(e)),
    total,
    page,
    limit
  }
})
