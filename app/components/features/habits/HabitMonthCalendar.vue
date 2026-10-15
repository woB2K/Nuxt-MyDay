<script lang="ts" setup>
import type { HabitItem } from '~~/shared/types'
import type { CalendarDay } from '~/utils/habits'
import { shiftDay } from '~~/shared/calendarDay'
import { fromDateString } from '~/utils/formatDate'
import { canMark, habitColor, habitStartDay, markWindow, monthWeeks } from '~/utils/habits'
import { monthStart, shiftMonth } from '~/utils/period'

const props = defineProps<{
  habit: HabitItem
  today: string
}>()

const emit = defineEmits<{ toggle: [date: string] }>()

const WEEK_ANCHOR = '2026-10-12'

const { t, locale } = useI18n()

const month = ref(monthStart(props.today))
const pulse = ref<{ date: string, key: number } | null>(null)

const tint = computed(() => habitColor(props.habit.color))
const weekly = computed(() => props.habit.perWeek !== null)
const firstMonth = computed(() => {
  const start = habitStartDay(props.habit)
  const windowStart = markWindow(props.today)[0]!

  return monthStart(start < windowStart ? start : windowStart)
})
const lastMonth = computed(() => monthStart(props.today))
const weeks = computed(() => monthWeeks(props.habit, month.value, props.today))
const intlLocale = computed(() => (locale.value === 'ru' ? 'ru-RU' : 'en-US'))

const title = computed(() => {
  const label = fromDateString(month.value)
    .toLocaleDateString(intlLocale.value, { month: 'long', year: 'numeric' })
    .replace(' г.', '')

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const weekdays = computed(() => {
  const format = new Intl.DateTimeFormat(intlLocale.value, { weekday: locale.value === 'ru' ? 'short' : 'narrow' })

  return Array.from({ length: 7 }, (_, index) => format.format(fromDateString(shiftDay(WEEK_ANCHOR, index))))
})

const columns = computed(() => (weekly.value ? 'repeat(7, minmax(0, 1fr)) 24px' : 'repeat(7, minmax(0, 1fr))'))

function shift(step: number) {
  month.value = shiftMonth(month.value, step)
}

function cellStyle(day: CalendarDay) {
  const ring = day.today ? { boxShadow: '0 0 0 2px var(--c-elev1), 0 0 0 3.5px var(--c-text)' } : {}

  if (day.state === 'done') return { ...ring, backgroundColor: tint.value, color: 'var(--c-h-ink)' }
  if (day.state === 'open') {
    return { ...ring, borderWidth: '1.5px', borderStyle: 'dashed', borderColor: tint.value, color: 'var(--c-text)' }
  }
  if (day.state === 'missed') {
    return { ...ring, backgroundColor: weekly.value ? 'transparent' : 'var(--c-elev3)', color: 'var(--c-text-dim)' }
  }

  return { ...ring, color: 'var(--c-text-mute)', opacity: 0.45 }
}

function toggle(day: CalendarDay) {
  pulse.value = { date: day.date, key: (pulse.value?.key ?? 0) + 1 }
  emit('toggle', day.date)
}
</script>

<template>
  <div class="rounded-lg border border-hairline bg-elev1 p-4" data-calendar>
    <div class="mb-3.5 flex items-center gap-2">
      <span class="flex-1 font-display text-[17px] font-semibold tracking-[-0.01em] text-text" data-month>{{ title }}</span>
      <UiRoundBtn :disabled="month <= firstMonth" :aria-label="t('habits.detail.prevMonth')" data-prev @click="shift(-1)">
        <UIcon name="i-lucide-chevron-left" class="size-4.5" />
      </UiRoundBtn>
      <UiRoundBtn :disabled="month >= lastMonth" :aria-label="t('habits.detail.nextMonth')" data-next @click="shift(1)">
        <UIcon name="i-lucide-chevron-right" class="size-4.5" />
      </UiRoundBtn>
    </div>

    <div class="grid" :style="{ gridTemplateColumns: columns, gap: weekly ? '5px' : '6px' }">
      <span
        v-for="(label, index) in weekdays"
        :key="index"
        data-weekday
        class="pb-0.5 text-center text-[11px] font-semibold tracking-[0.04em] uppercase text-text-mute"
      >{{ label }}</span>
      <span v-if="weekly" />

      <template v-for="(week, row) in weeks" :key="`${month}-${row}`">
        <template v-for="(day, column) in week.days" :key="`${row}-${column}`">
          <span v-if="!day" />
          <button
            v-else-if="day.state !== 'inactive' && canMark(day.date, props.today)"
            :key="`${day.date}-${pulse?.date === day.date ? pulse.key : 0}`"
            class="box-border flex aspect-square items-center justify-center rounded-[10px] p-0 text-sm font-semibold tabular-nums transition-colors duration-200"
            type="button"
            :style="{
              ...cellStyle(day),
              animation: pulse?.date === day.date ? 'habit-pop 360ms var(--ease-spring) both' : 'none',
            }"
            :aria-pressed="day.state === 'done'"
            :data-day="day.date"
            :data-state="day.state"
            @click="toggle(day)"
          >
            {{ day.day }}
          </button>
          <span
            v-else
            class="box-border flex aspect-square items-center justify-center rounded-[10px] text-sm tabular-nums"
            :class="day.state === 'done' ? 'font-semibold' : 'font-medium'"
            :style="cellStyle(day)"
            :data-day="day.date"
            :data-state="day.state"
          >
            {{ day.day }}
          </span>
        </template>

        <span v-if="weekly" class="flex items-center justify-center" :data-week-summary="week.summary ? week.summary.count : ''">
          <template v-if="week.summary">
            <span
              v-if="week.summary.ok"
              class="flex size-5 items-center justify-center rounded-full"
              :style="{ backgroundColor: tint, color: 'var(--c-h-ink)' }"
            >
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
            <span
              v-else
              class="text-[11px] font-semibold tabular-nums"
              :class="week.summary.current ? 'text-text-dim' : 'text-text-mute'"
            >{{ week.summary.count }}/{{ props.habit.perWeek }}</span>
          </template>
        </span>
      </template>
    </div>

    <div class="mt-4 flex flex-wrap gap-3.5">
      <span class="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
        <span class="size-3 rounded-[4px]" :style="{ backgroundColor: tint }" />
        {{ t('habits.detail.legendDone') }}
      </span>
      <span class="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
        <span class="box-border size-3 rounded-[4px] border-[1.5px] border-dashed" :style="{ borderColor: tint }" />
        {{ t('habits.detail.legendCan') }}
      </span>
      <span v-if="weekly" class="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
        <span class="flex size-3.5 items-center justify-center rounded-full" :style="{ backgroundColor: tint, color: 'var(--c-h-ink)' }">
          <UIcon name="i-lucide-check" class="size-[9px]" />
        </span>
        {{ t('habits.detail.legendPlan') }}
      </span>
      <span v-else class="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
        <span class="size-3 rounded-[4px] bg-elev3" />
        {{ t('habits.detail.legendMissed') }}
      </span>
    </div>
    <div class="mt-2 text-xs leading-4 text-text-mute">
      {{ weekly ? t('habits.detail.hintWeekly') : t('habits.detail.hint') }}
    </div>
  </div>
</template>
