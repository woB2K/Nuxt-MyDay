import type { Prisma } from '~~/prisma/.generated/prisma'
import { getHousehold } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { dateRangeQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const { from, to } = await getValidatedQuery(event, dateRangeQuerySchema.parse)

  const where: Prisma.BudgetWhereInput = { householdId: household.id }

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
