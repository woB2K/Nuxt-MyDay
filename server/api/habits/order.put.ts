import { habitOrderSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { ids: rawIds } = await readValidatedBody(event, habitOrderSchema.parse)
  const ids = [...new Set(rawIds)]

  const owned = await prisma.habit.count({ where: { id: { in: ids }, userId, deletedAt: null } })

  if (owned !== ids.length) throw createError({ statusCode: 400, message: 'Unknown habit' })

  await prisma.$transaction(ids.map((id, sortOrder) => prisma.habit.update({
    where: { id },
    data: { sortOrder }
  })))

  return { ids }
})
