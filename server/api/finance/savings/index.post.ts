import { mapAmount } from '~~/server/utils/mapper'
import { createSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createSavingsSchema.parse)

  const savings = await prisma.savingsEntry.create({
    data: {
      ...body,
      userId
    }
  })

  return mapAmount(savings)
})
