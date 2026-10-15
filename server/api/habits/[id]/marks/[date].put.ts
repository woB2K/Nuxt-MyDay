import { assertMarkWindow, findOwnedHabit, loadHabitItem } from '~~/server/utils/habits'
import { habitMarkParamsSchema, habitMarkTodaySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId

  const { id, date } = await getValidatedRouterParams(event, habitMarkParamsSchema.parse)
  const { today } = await getValidatedQuery(event, habitMarkTodaySchema.parse)

  assertMarkWindow(date, today)

  const habit = await findOwnedHabit(id, userId)
  const day = new Date(date)

  await prisma.habitMark.upsert({
    where: { habitId_date: { habitId: habit.id, date: day } },
    create: { habitId: habit.id, date: day },
    update: {}
  })

  return loadHabitItem(habit.id)
})
