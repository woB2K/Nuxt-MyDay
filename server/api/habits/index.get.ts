import { habitMarks, toHabitItem } from '~~/server/utils/habits'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const habits = await prisma.habit.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: habitMarks
  })

  return habits.map(habit => toHabitItem(habit))
})
