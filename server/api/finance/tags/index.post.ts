import { orConflict } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { createFinanceTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const body = await readValidatedBody(event, createFinanceTagSchema.parse)

  return orConflict(
    prisma.financeTag.create({ data: { ...body, householdId: household.id } }),
    'Tag already exists'
  )
})
