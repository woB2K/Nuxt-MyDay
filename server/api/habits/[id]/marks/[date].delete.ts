import { assertMarkWindow, findOwnedHabit, loadHabitItem } from '~~/server/utils/habits'
import { habitMarkParamsSchema, habitMarkTodaySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { id, date } = await getValidatedRouterParams(event, habitMarkParamsSchema.parse)
  const { today } = await getValidatedQuery(event, habitMarkTodaySchema.parse)

  assertMarkWindow(date, today)

  const habit = await findOwnedHabit(id, userId)

  await prisma.habitMark.deleteMany({ where: { habitId: habit.id, date: new Date(date) } })

  return loadHabitItem(habit.id)
})
