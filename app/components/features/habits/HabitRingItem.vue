<script lang="ts" setup>
import type { HabitItem } from '~~/shared/types'
import type { HabitFx } from '~/utils/habits'
import { habitIconName, habitRing, habitStats } from '~/utils/habits'

const props = withDefaults(defineProps<{
  habit: HabitItem
  today: string
  fx?: HabitFx | null
}>(), { fx: null })

const emit = defineEmits<{ toggle: [], open: [] }>()

const ring = computed(() => habitRing(props.habit, props.today))
const stats = computed(() => habitStats(props.habit, props.today))

const press = useLongPress(() => emit('open'))
</script>

<template>
  <div
    class="ring-item flex w-16 shrink-0 select-none flex-col items-center"
    :data-habit="props.habit.id"
    @pointerdown="press.start"
    @pointerup="press.cancel"
    @pointerleave="press.cancel"
    @pointercancel="press.cancel"
    @click.capture="press.guard"
    @contextmenu.prevent
  >
    <UiHabitRing
      :icon="habitIconName(props.habit.icon)"
      :color="props.habit.color"
      :segments="ring.segments"
      :filled="ring.filled"
      :checked="ring.checked"
      :label="props.habit.name"
      :fx="props.fx"
      @toggle="emit('toggle')"
    />
    <span class="mt-1.5 line-clamp-2 w-full text-center text-xs leading-[15px] font-medium break-words text-text-dim">
      {{ props.habit.name }}
    </span>
    <span class="mt-auto box-border flex h-[17px] items-center pt-[3px]">
      <UiStreakTag :value="stats.current" :active="stats.active" :color="props.habit.color" :fx="props.fx" />
    </span>
  </div>
</template>

<style scoped>
.ring-item {
  -webkit-touch-callout: none;
}
</style>
