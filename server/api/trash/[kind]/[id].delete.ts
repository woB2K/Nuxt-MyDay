import { trashItemParamsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { kind, id } = await getValidatedRouterParams(event, trashItemParamsSchema.parse)

  const where = { id, userId, deletedAt: { not: null } }

  const deleteByKind = {
    task: () => prisma.task.deleteMany({ where }),
    transaction: () => prisma.transaction.deleteMany({ where }),
    savings: () => prisma.savingsEntry.deleteMany({ where })
  }

  const { count } = await deleteByKind[kind]()

  if (count === 0) throw createError({ statusCode: 404, message: 'Item not found in trash' })

  return { deleted: count }
})
