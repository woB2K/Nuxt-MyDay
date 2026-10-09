import { getHousehold } from '~~/server/utils/household'
import { trashScopes } from '~~/server/utils/trash'
import { trashItemParamsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { kind, id } = await getValidatedRouterParams(event, trashItemParamsSchema.parse)

  const scopes = trashScopes(event.context.userId, await getHousehold(event))
  const deletedAt = { not: null }

  const deleteByKind = {
    task: () => prisma.task.deleteMany({ where: { id, ...scopes.task, deletedAt } }),
    transaction: () => prisma.transaction.deleteMany({ where: { id, ...scopes.transaction, deletedAt } }),
    savings: () => prisma.savingsEntry.deleteMany({ where: { id, ...scopes.savings, deletedAt } })
  }

  const { count } = await deleteByKind[kind]()

  if (count === 0) throw createError({ statusCode: 404, message: 'Item not found in trash' })

  return { deleted: count }
})
