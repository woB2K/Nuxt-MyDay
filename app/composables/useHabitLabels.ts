import type { HabitItem } from '~~/shared/types'

export function useHabitLabels() {
  const { t } = useI18n()

  function plan(perWeek: number | null) {
    return perWeek === null ? t('habits.plan.daily') : t('habits.plan.weekly', { count: perWeek }, perWeek)
  }

  function planShort(perWeek: number) {
    return t('habits.plan.short', { count: perWeek })
  }

  function streak(habit: Pick<HabitItem, 'perWeek'>, count: number) {
    return habit.perWeek === null
      ? t('habits.days', { count }, count)
      : t('habits.times', { count }, count)
  }

  return { plan, planShort, streak }
}
