import { orNotFound } from '~~/server/utils/dbError'
import { habitMarks, toHabitItem } from '~~/server/utils/habits'
import { inTrash } from '~~/server/utils/trash'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const id = getRouterParam(event, 'id')

  const habit = await orNotFound(
    prisma.habit.update({
      where: { id, userId, deletedAt: inTrash() },
      data: { deletedAt: null },
      include: habitMarks
    }),
    'Habit not found'
  )

  return toHabitItem(habit)
})
