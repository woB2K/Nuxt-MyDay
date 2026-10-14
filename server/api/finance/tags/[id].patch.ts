import { orConflict, orNotFound } from '~~/server/utils/dbError'
import { getHousehold } from '~~/server/utils/household'
import { updateFinanceTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const tagId = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateFinanceTagSchema.parse)

  return orConflict(
    orNotFound(
      prisma.financeTag.update({ where: { id: tagId, householdId: household.id }, data: body }),
      'Tag not found'
    ),
    'Tag already exists'
  )
})
