<script lang="ts" setup>
import type { HabitColor } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitColor, habitSoft } from '~/utils/habits'

interface Props {
  icon: string
  color: HabitColor
  segments?: number
  filled?: number
  checked?: boolean
  size?: number
  label?: string
  fx?: HabitFx | null
}

const props = withDefaults(defineProps<Props>(), {
  segments: 1,
  filled: 0,
  checked: false,
  size: 56,
  label: undefined,
  fx: null
})

const emit = defineEmits<{ toggle: [] }>()

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

const tint = computed(() => habitColor(props.color))
const complete = computed(() => props.segments > 1 && props.filled >= props.segments)
const iconSize = computed(() => `${Math.round(props.size * 0.4)}px`)
const fxKey = computed(() => props.fx?.key ?? 0)
const popped = computed(() => props.fx?.type === 'on' || props.fx?.type === 'record')

const discAnimation = computed(() => {
  const fx = props.fx
  if (!fx) return 'none'
  if (fx.type === 'off') return 'habit-off 240ms var(--ease-out) both'
  if (fx.type === 'wave') return `habit-wave 420ms var(--ease-spring) ${fx.delay ?? 0}ms both`

  return 'habit-pop 380ms var(--ease-spring) both'
})
</script>

<template>
  <button
    class="relative shrink-0 rounded-full p-0"
    type="button"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    :aria-pressed="props.checked"
    :aria-label="props.label"
    @click="emit('toggle')"
  >
    <UiSegArcs
      :size="props.size"
      :stroke="3"
      :segments="props.segments"
      :filled="props.filled"
      :color="tint"
    />

    <span
      v-if="complete"
      :key="`badge-${fxKey}`"
      class="absolute -right-0.5 -bottom-0.5 z-[1] flex size-5 items-center justify-center rounded-full border-2 border-bg"
      :style="{
        backgroundColor: tint,
        color: 'var(--c-h-ink)',
        animation: popped ? 'habit-badge 360ms var(--ease-spring) 300ms both' : 'none',
      }"
      data-plan-done
    >
      <UIcon name="i-lucide-check" class="size-2.5" />
    </span>

    <span
      :key="`disc-${fxKey}`"
      class="absolute inset-1.5 flex items-center justify-center rounded-full"
      :style="{
        backgroundColor: props.checked ? tint : habitSoft(props.color),
        color: props.checked ? 'var(--c-h-ink)' : tint,
        transition: `background-color 200ms var(--ease-out) ${props.checked ? 120 : 0}ms, color 200ms var(--ease-out) ${props.checked ? 120 : 0}ms`,
        animation: discAnimation,
      }"
      data-disc
    >
      <UIcon :name="props.icon" :style="{ width: iconSize, height: iconSize }" />
    </span>

    <span v-if="props.fx?.type === 'record'" :key="`burst-${fxKey}`" class="pointer-events-none absolute inset-0" data-burst>
      <span
        v-for="angle in BURST_ANGLES"
        :key="angle"
        class="absolute size-1.5 rounded-full"
        :style="{
          'left': `${props.size / 2 - 3}px`,
          'top': `${props.size / 2 - 3}px`,
          'backgroundColor': tint,
          '--burst-angle': `${angle}deg`,
          '--burst-distance': `${-(props.size / 2 + 10)}px`,
          'animation': 'habit-burst 420ms var(--ease-out) both',
        }"
      />
    </span>
  </button>
</template>
