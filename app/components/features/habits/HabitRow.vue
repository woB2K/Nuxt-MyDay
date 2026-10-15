<script lang="ts" setup>
import type { HabitItem } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitColor, habitIconName, habitRing, habitSoft, habitStats, weekDots } from '~/utils/habits'

const props = withDefaults(defineProps<{
  habit: HabitItem
  today: string
  fx?: HabitFx | null
  reorder?: boolean
}>(), { fx: null, reorder: false })

const emit = defineEmits<{ toggle: [], open: [] }>()

const { t } = useI18n()
const labels = useHabitLabels()

const stats = computed(() => habitStats(props.habit, props.today))
const ring = computed(() => habitRing(props.habit, props.today))
const dots = computed(() => weekDots(props.habit, props.today))

function open() {
  if (!props.reorder) emit('open')
}
</script>

<template>
  <div
    class="flex min-h-[68px] items-center gap-3 rounded-lg border border-hairline bg-elev1 py-3 pr-4 pl-3.5 select-none"
    :class="props.reorder ? 'cursor-grab' : 'cursor-pointer'"
    data-habit-row
    @click="open"
  >
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-full"
      :style="{ backgroundColor: habitSoft(props.habit.color), color: habitColor(props.habit.color) }"
    >
      <UIcon :name="habitIconName(props.habit.icon)" class="size-5.5" />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-baseline gap-1.5">
        <span class="min-w-0 truncate text-base font-semibold tracking-[-0.005em] text-text">{{ props.habit.name }}</span>
        <span v-if="props.habit.perWeek" class="shrink-0 whitespace-nowrap text-xs font-medium text-text-mute" data-plan>
          {{ labels.planShort(props.habit.perWeek) }}
        </span>
      </div>

      <div class="mt-1.5 flex min-w-0 items-center gap-2.5">
        <UiWeekDots :days="dots" :color="props.habit.color" :weekly="props.habit.perWeek !== null" />
        <span
          v-if="stats.broken"
          class="inline-flex min-w-0 items-center gap-1 truncate text-xs font-medium text-text-mute"
          data-restart
        >
          <UIcon name="i-lucide-rotate-ccw" class="size-3 shrink-0" />
          {{ t('habits.list.restart') }} · {{ t('habits.list.best', { n: stats.best }) }}
        </span>
        <UiStreakTag
          v-else
          :value="stats.current"
          :active="stats.active"
          :color="props.habit.color"
          :label="labels.streak(props.habit, stats.current)"
          :fx="props.fx"
        />
      </div>
    </div>

    <span v-if="props.reorder" class="flex h-11 w-[30px] cursor-grab touch-none items-center justify-center text-text-mute" data-grip>
      <UIcon name="i-lucide-grip-vertical" class="size-5" />
    </span>
    <UiHabitCheck
      v-else
      :color="props.habit.color"
      :checked="ring.checked"
      :segments="ring.segments"
      :filled="ring.filled"
      :label="props.habit.name"
      :fx="props.fx"
      @toggle="emit('toggle')"
    />
  </div>
</template>
