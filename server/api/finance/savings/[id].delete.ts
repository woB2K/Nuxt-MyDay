import { mapAmount } from '~~/server/utils/mapper'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const savingsId = getRouterParam(event, 'id')

  const entry = await prisma.savingsEntry.delete({
    where: {
      id: savingsId,
      userId
    }
  })

  return mapAmount(entry)
})
