<script lang="ts" setup>
import { toDateString } from '~/utils/formatDate'

interface Props {
  modelValue: string
  days?: number
}

const props = withDefaults(defineProps<Props>(), { days: 7 })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { locale } = useI18n()

const days = computed(() => {
  const weekday = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
  const today = new Date()

  return Array.from({ length: props.days }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)

    return {
      value: toDateString(date),
      weekday: weekday.format(date),
      day: date.getDate()
    }
  })
})

function select(value: string) {
  emit('update:modelValue', props.modelValue === value ? '' : value)
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-0.5">
    <button
      v-for="item in days"
      :key="item.value"
      class="shrink-0 w-12 h-[62px] flex flex-col items-center justify-center gap-1 rounded-md border transition-colors duration-fast"
      :class="item.value === props.modelValue
        ? 'bg-accent border-accent'
        : 'bg-elev2 border-hairline'"
      type="button"
      @click="select(item.value)"
    >
      <span
        class="text-[11px] font-semibold uppercase tracking-wider"
        :class="item.value === props.modelValue ? 'text-accent-ink' : 'text-text-mute'"
      >
        {{ item.weekday }}
      </span>
      <span
        class="text-[17px] font-bold leading-none font-display"
        :class="item.value === props.modelValue ? 'text-accent-ink' : 'text-text'"
      >
        {{ item.day }}
      </span>
    </button>
  </div>
</template>
