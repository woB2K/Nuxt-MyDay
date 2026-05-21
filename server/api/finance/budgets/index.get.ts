import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const query = getQuery(event)
  const month = query.month
    ? new Date(query.month as string)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month
    }
  })

  return budgets.map(b => mapAmount(b))
})
