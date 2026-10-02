import type { Prisma } from '~~/prisma/.generated/prisma'
import { mapAmount } from '~~/server/utils/mapper'
import { dateRangeQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { from, to } = await getValidatedQuery(event, dateRangeQuerySchema.parse)

  const where: Prisma.BudgetWhereInput = { userId }

  if (from || to) {
    where.month = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) })
    }
  }

  const budgets = await prisma.budget.findMany({
    where,
    orderBy: { month: 'desc' }
  })

  return budgets.map(b => mapAmount(b))
})
