export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const where = { userId, deletedAt: { not: null } }

  const [tasks, transactions, savings] = await prisma.$transaction([
    prisma.task.deleteMany({ where }),
    prisma.transaction.deleteMany({ where }),
    prisma.savingsEntry.deleteMany({ where })
  ])

  return { deleted: tasks.count + transactions.count + savings.count }
})
