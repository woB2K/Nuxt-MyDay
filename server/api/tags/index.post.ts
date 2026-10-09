import { getHousehold } from '~~/server/utils/household'
import { createTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  const body = await readValidatedBody(event, createTagSchema.parse)

  try {
    return await prisma.tag.create({
      data: { ...body, householdId: household.id }
    })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Tag already exists' })
    }
    throw e
  }
})
