<script lang="ts" setup>
import type { HabitColor } from '~~/shared/types'
import type { WeekDot } from '~/utils/habits'
import { habitColor } from '~/utils/habits'

interface Props {
  days: WeekDot[]
  color: HabitColor
  weekly?: boolean
}

const props = withDefaults(defineProps<Props>(), { weekly: false })

const tint = computed(() => habitColor(props.color))

function outline(day: WeekDot) {
  if (day.marked) return {}
  if (day.today) return { borderWidth: '1.5px', borderStyle: 'solid', borderColor: tint.value }
  if (props.weekly) return { borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--c-hairline2)' }

  return {}
}

function dotStyle(day: WeekDot, index: number) {
  const empty = props.weekly || day.today ? 'transparent' : 'var(--c-elev3)'

  return {
    marginLeft: props.weekly && day.weekStart && index > 0 ? '3px' : undefined,
    backgroundColor: day.marked ? tint.value : empty,
    ...outline(day)
  }
}
</script>

<template>
  <span class="flex shrink-0 gap-[3px]" aria-hidden="true">
    <span
      v-for="(day, index) in props.days"
      :key="day.date"
      class="box-border size-2 rounded-[2.5px] transition-colors duration-200"
      :style="dotStyle(day, index)"
      :data-dot="day.marked ? 'marked' : 'empty'"
    />
  </span>
</template>
