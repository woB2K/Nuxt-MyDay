import { getHousehold } from '~~/server/utils/household'
import { createCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const body = await readValidatedBody(event, createCategorySchema.parse)

  return prisma.category.create({
    data: { ...body, householdId: household.id }
  })
})
