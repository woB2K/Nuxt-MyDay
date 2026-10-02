import { mapAmount } from '~~/server/utils/mapper'
import { createBudgetSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createBudgetSchema.parse)

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, userId }
  })

  if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })

  const budget = await prisma.budget.upsert({
    where: { userId_categoryId_month: { userId, categoryId: body.categoryId, month: body.month } },
    create: { ...body, userId },
    update: { amount: body.amount }
  })

  return mapAmount(budget)
})
