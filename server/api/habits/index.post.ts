import { habitMarks, toHabitItem } from '~~/server/utils/habits'
import { createHabitSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const body = await readValidatedBody(event, createHabitSchema.parse)

  const { _max } = await prisma.habit.aggregate({
    where: { userId, deletedAt: null },
    _max: { sortOrder: true }
  })

  const habit = await prisma.habit.create({
    data: { ...body, userId, sortOrder: (_max.sortOrder ?? -1) + 1 },
    include: habitMarks
  })

  return toHabitItem(habit)
})
