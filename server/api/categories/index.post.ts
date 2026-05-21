import { createCategorySchema } from '~~/shared/schemas/finance'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createCategorySchema.parse)

  return prisma.category.create({
    data: { ...body, userId }
  })
})
