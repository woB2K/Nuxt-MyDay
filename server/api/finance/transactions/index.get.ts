import { getHousehold } from '~~/server/utils/household'
import { toTransactionItem, transactionTags } from '~~/server/utils/mapper'
import { transactionWhere } from '~~/server/utils/transactionWhere'
import { transactionQuerySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const { page, limit, ...filters } = await getValidatedQuery(event, transactionQuerySchema.parse)

  const where = transactionWhere(household.id, filters, event.context.userId)

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: transactionTags
    }),
    prisma.transaction.count({ where })
  ])

  return {
    data: items.map(item => toTransactionItem(item)),
    total,
    page,
    limit
  }
})
