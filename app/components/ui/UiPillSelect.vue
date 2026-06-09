<script lang="ts" setup>
interface Option {
  value: string
  label: string
  color?: string
  inkColor?: string
}

interface Props {
  modelValue: string
  options: Array<Option>
  full?: boolean
  bgClass?: string
}

const props = withDefaults(defineProps<Props>(), { full: false, bgClass: 'bg-elev2' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div
    class="flex gap-1 p-1 rounded-full"
    :class="[props.bgClass, props.full ? 'w-full' : 'w-fit']"
  >
    <button
      v-for="option in props.options"
      :key="option.value"
      class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150"
      :class="[
        props.full ? 'flex-1' : '',
        option.value === props.modelValue && !option.color
          ? 'bg-accent text-accent-ink'
          : option.value !== props.modelValue
            ? 'text-text-dim hover:text-text'
            : ''
      ]"
      :style="option.value === props.modelValue && option.color
        ? { backgroundColor: option.color, color: option.inkColor ?? '#0F0F14' }
        : {}"
      type="button"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
