import type { MaybeRefOrGetter } from 'vue'
import type { HabitItem } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitsProgress, habitStreaks, isMarked, isNewRecord, withMark } from '~/utils/habits'
import { useHabitLabels } from './useHabitLabels'
import { useToggleHabitMarkMutation } from './useHabits'

const ALL_DONE_DELAY = 380
const WAVE_STEP = 40

let celebratedOn = ''

export function useHabitMarking(today: MaybeRefOrGetter<string>) {
  const { mutate } = useToggleHabitMarkMutation()
  const { t } = useI18n()
  const toast = useAppToast()
  const labels = useHabitLabels()

  const fx = ref<Record<string, HabitFx>>({})
  const celebration = ref(0)
  const celebrating = ref(false)
  let seq = 0

  function play(id: string, type: HabitFx['type'], delay?: number) {
    seq += 1
    fx.value = { ...fx.value, [id]: { type, key: seq, delay } }
  }

  function celebrate(before: HabitItem[], after: HabitItem[], markedId: string, day: string) {
    if (celebratedOn === day) return
    if (!habitsProgress(after, day).all || habitsProgress(before, day).all) return

    celebratedOn = day
    celebrating.value = true
    setTimeout(() => {
      celebrating.value = false
      celebration.value += 1
      after.forEach((habit, index) => {
        if (habit.id !== markedId) play(habit.id, 'wave', index * WAVE_STEP)
      })
    }, ALL_DONE_DELAY)
  }

  function toggle(habits: HabitItem[], habit: HabitItem, date?: string) {
    const day = toValue(today)
    const target = date ?? day
    const marked = !isMarked(habit, target)
    const next = withMark(habit, target, marked)
    const record = marked && isNewRecord(habit, next, day)

    play(habit.id, record ? 'record' : marked ? 'on' : 'off')
    mutate({ id: habit.id, date: target, marked })

    if (record) {
      const best = habitStreaks(next, day).best
      toast.success(t('toast.habits.record', { n: labels.streak(next, best) }))
    }

    if (marked && target === day) {
      celebrate(habits, habits.map(item => (item.id === habit.id ? next : item)), habit.id, day)
    }
  }

  return { fx, celebration, celebrating, toggle }
}
