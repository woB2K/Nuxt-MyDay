<script lang="ts" setup>
interface Props {
  modelValue: boolean
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 26,
  color: 'var(--c-accent)',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <button
    class="rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200"
    :class="modelValue ? 'border-transparent' : 'border-hairline2'"
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundColor: modelValue ? props.color : 'transparent',
    }"
    @click="emit('update:modelValue', !modelValue)"
  >
    <svg
      v-if="modelValue"
      class="check-pop"
      viewBox="0 0 12 10"
      fill="none"
      :width="props.size * 0.46"
      :height="props.size * 0.46"
    >
      <path
        d="M1 5L4.5 8.5L11 1.5"
        stroke="var(--c-accentInk)"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped>
@keyframes check-spring {
  0%   { transform: scale(0.6); }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.check-pop {
  animation: check-spring 200ms ease-out forwards;
}
</style>
