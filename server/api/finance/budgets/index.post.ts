import { getHousehold } from '~~/server/utils/household'
import { mapAmount } from '~~/server/utils/mapper'
import { createBudgetSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const body = await readValidatedBody(event, createBudgetSchema.parse)

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, householdId: household.id }
  })

  if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })

  const budget = await prisma.budget.upsert({
    where: { householdId_categoryId_month: { householdId: household.id, categoryId: body.categoryId, month: body.month } },
    create: { ...body, householdId: household.id },
    update: { amount: body.amount }
  })

  return mapAmount(budget)
})
