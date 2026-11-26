<script lang="ts" setup>
import { REMINDER_STEP_MINUTES } from '~~/shared/schemas'
import { snapReminderTime } from '~/utils/push'

const props = defineProps<{ label?: string }>()

const modelValue = defineModel<string>({ required: true })

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const snapped = snapReminderTime(input.value)

  if (!snapped) {
    input.value = modelValue.value
    return
  }

  input.value = snapped
  modelValue.value = snapped
}
</script>

<template>
  <input
    :value="modelValue"
    type="time"
    :step="REMINDER_STEP_MINUTES * 60"
    :aria-label="props.label"
    class="h-9 rounded-lg bg-elev3 px-3 font-display text-[15px] font-semibold tabular-nums text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
    @change="onChange"
  >
</template>
