import { getHousehold } from '~~/server/utils/household'
import { mapAmount, normalizeTags } from '~~/server/utils/mapper'
import { purgeExpiredTrash, trashScopes } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  await purgeExpiredTrash(userId, household)

  const scopes = trashScopes(userId, household)
  const deletedAt = { not: null }
  const orderBy = { deletedAt: 'desc' } as const

  const [tasks, transactions, savings] = await Promise.all([
    prisma.task.findMany({
      where: { ...scopes.task, deletedAt },
      orderBy,
      include: {
        tags: { include: { tag: true } }
      }
    }),
    prisma.transaction.findMany({ where: { ...scopes.transaction, deletedAt }, orderBy }),
    prisma.savingsEntry.findMany({ where: { ...scopes.savings, deletedAt }, orderBy })
  ])

  return {
    tasks: tasks.map(el => normalizeTags(el)),
    transactions: transactions.map(el => mapAmount(el)),
    savings: savings.map(el => mapAmount(el))
  }
})
