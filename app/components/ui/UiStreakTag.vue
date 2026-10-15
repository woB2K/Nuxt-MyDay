<script lang="ts" setup>
import type { HabitColor } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitColor } from '~/utils/habits'

interface Props {
  value: number
  active: boolean
  color: HabitColor
  label?: string
  size?: number
  dash?: boolean
  fx?: HabitFx | null
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 12,
  dash: true,
  fx: null
})

const flared = computed(() => props.fx?.type === 'on' || props.fx?.type === 'record')
const iconSize = computed(() => `${props.size}px`)
</script>

<template>
  <span
    v-if="props.value > 0"
    class="inline-flex items-center gap-[3px] font-semibold leading-none tabular-nums transition-colors duration-200"
    :style="{ color: props.active ? habitColor(props.color) : 'var(--c-text-mute)', fontSize: `${props.size}px` }"
    data-streak
  >
    <span
      :key="`flame-${flared ? props.fx?.key : 0}`"
      class="flex"
      :style="{ animation: flared ? 'habit-flare 360ms var(--ease-spring) 120ms both' : 'none' }"
    >
      <UIcon
        :name="props.fx?.type === 'record' ? 'i-lucide-trophy' : 'i-lucide-flame'"
        :style="{ width: iconSize, height: iconSize }"
      />
    </span>
    {{ props.label ?? props.value }}
  </span>
  <span
    v-else-if="props.dash"
    class="font-semibold leading-none text-text-mute"
    :style="{ fontSize: `${props.size}px` }"
    data-streak
  >—</span>
</template>
