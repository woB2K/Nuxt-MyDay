import { mapAmount } from '~~/server/utils/mapper'
import { createTransactionSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createTransactionSchema.parse)

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, userId }
  })

  if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })
  if (category.type !== body.type) throw createError({ statusCode: 400, message: 'Category type does not match transaction type' })

  const transaction = await prisma.transaction.create({
    data: { ...body, date: new Date(body.date), userId }
  })

  return mapAmount(transaction)
})
