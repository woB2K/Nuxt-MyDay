import { orNotFound } from '~~/server/utils/dbError'
import { habitMarks, toHabitItem } from '~~/server/utils/habits'
import { updateHabitSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const body = await readValidatedBody(event, updateHabitSchema.parse)

  const habit = await orNotFound(
    prisma.habit.update({
      where: { id, userId, deletedAt: null },
      data: body,
      include: habitMarks
    }),
    'Habit not found'
  )

  return toHabitItem(habit)
})
