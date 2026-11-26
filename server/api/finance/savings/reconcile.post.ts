import { getHousehold } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { roundMoney, savingsBalanceOf } from '~~/server/utils/savingsBalance'
import { reconcileSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const { actual, notes } = await readValidatedBody(event, reconcileSavingsSchema.parse)

  const entry = await prisma.$transaction(async (tx) => {
    const rows = await tx.savingsEntry.groupBy({
      by: ['type'],
      where: { householdId: household.id, userId, deletedAt: null },
      _sum: { amount: true }
    })

    const difference = roundMoney(actual - savingsBalanceOf(rows))

    if (difference === 0) throw createError({ statusCode: 400, message: 'Balance already matches' })

    return tx.savingsEntry.create({
      data: { householdId: household.id, userId, type: 'ADJUSTMENT', amount: difference, notes }
    })
  })

  return mapAmount(entry)
})
