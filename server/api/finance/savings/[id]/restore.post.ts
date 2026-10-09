import { mapAmount } from '~~/server/utils/mapper'
import { inTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const savingsId = getRouterParam(event, 'id')

  const entry = await prisma.savingsEntry.findFirst({
    where: { id: savingsId, userId, deletedAt: inTrash() }
  })

  if (!entry) throw createError({ statusCode: 404, message: 'Savings entry not found' })

  if (entry.type === 'OPENING') {
    const existing = await prisma.savingsEntry.count({ where: { userId, type: 'OPENING', deletedAt: null } })

    if (existing > 0) throw createError({ statusCode: 409, message: 'Opening balance already set' })
  }

  const restored = await prisma.savingsEntry.update({
    where: { id: entry.id },
    data: { deletedAt: null }
  })

  return mapAmount(restored)
})
