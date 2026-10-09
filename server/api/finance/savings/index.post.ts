import { mapAmount } from '~~/server/utils/mapper'
import { createSavingsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createSavingsSchema.parse)

  if (body.type === 'OPENING') {
    const existing = await prisma.savingsEntry.count({ where: { userId, type: 'OPENING', deletedAt: null } })

    if (existing > 0) throw createError({ statusCode: 409, message: 'Opening balance already set' })
  }

  const savings = await prisma.savingsEntry.create({
    data: {
      ...body,
      userId
    }
  })

  return mapAmount(savings)
})
