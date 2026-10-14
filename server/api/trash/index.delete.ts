import { getHousehold } from '~~/server/utils/household'
import { trashScopes } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const scopes = trashScopes(event.context.userId, await getHousehold(event))
  const deletedAt = { not: null }

  const [tasks, transactions, savings] = await prisma.$transaction([
    prisma.task.deleteMany({ where: { ...scopes.task, deletedAt } }),
    prisma.transaction.deleteMany({ where: { ...scopes.transaction, deletedAt } }),
    prisma.savingsEntry.deleteMany({ where: { ...scopes.savings, deletedAt } })
  ])

  return { deleted: tasks.count + transactions.count + savings.count }
})
