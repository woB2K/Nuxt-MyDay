import { mapAmount, normalizeTags } from '~~/server/utils/mapper'
import { purgeExpiredTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  await purgeExpiredTrash(userId)

  const where = { userId, deletedAt: { not: null } }
  const orderBy = { deletedAt: 'desc' } as const

  const [tasks, transactions, savings] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      include: {
        tags: { include: { tag: true } }
      }
    }),
    prisma.transaction.findMany({ where, orderBy }),
    prisma.savingsEntry.findMany({ where, orderBy })
  ])

  return {
    tasks: tasks.map(el => normalizeTags(el)),
    transactions: transactions.map(el => mapAmount(el)),
    savings: savings.map(el => mapAmount(el))
  }
})
