<script lang="ts" setup>
import type { HabitColor } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitColor } from '~/utils/habits'

interface Props {
  color: HabitColor
  checked?: boolean
  segments?: number
  filled?: number
  size?: number
  label?: string
  fx?: HabitFx | null
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  segments: 1,
  filled: 0,
  size: 30,
  label: undefined,
  fx: null
})

const emit = defineEmits<{ toggle: [] }>()

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

const tint = computed(() => habitColor(props.color))
const fxKey = computed(() => props.fx?.key ?? 0)
const popped = computed(() => props.fx?.type === 'on' || props.fx?.type === 'record')
</script>

<template>
  <button
    class="relative -m-[7px] flex size-11 shrink-0 items-center justify-center p-0"
    type="button"
    :aria-pressed="props.checked"
    :aria-label="props.label"
    @click.stop="emit('toggle')"
  >
    <span v-if="props.segments > 1" class="absolute top-0.5 left-0.5 size-10">
      <UiSegArcs
        :size="40"
        :stroke="2"
        :segments="props.segments"
        :filled="props.filled"
        :color="tint"
        :gap="3"
      />
    </span>

    <span
      :key="`check-${fxKey}`"
      class="flex items-center justify-center rounded-full"
      :class="props.checked ? '' : 'border-2 border-hairline2'"
      :style="{
        width: `${props.size}px`,
        height: `${props.size}px`,
        backgroundColor: props.checked ? tint : 'transparent',
        color: 'var(--c-h-ink)',
        transition: 'background-color 200ms var(--ease-out)',
        animation: popped ? 'habit-pop 380ms var(--ease-spring) both' : 'none',
      }"
      data-check
    >
      <UIcon v-if="props.checked" name="i-lucide-check" :style="{ width: `${props.size * 0.55}px`, height: `${props.size * 0.55}px` }" />
    </span>

    <span v-if="props.fx?.type === 'record'" :key="`burst-${fxKey}`" class="pointer-events-none absolute inset-0">
      <span
        v-for="angle in BURST_ANGLES"
        :key="angle"
        class="absolute top-[19px] left-[19px] size-1.5 rounded-full"
        :style="{
          'backgroundColor': tint,
          '--burst-angle': `${angle}deg`,
          '--burst-distance': '-32px',
          'animation': 'habit-burst 420ms var(--ease-out) both',
        }"
      />
    </span>
  </button>
</template>
