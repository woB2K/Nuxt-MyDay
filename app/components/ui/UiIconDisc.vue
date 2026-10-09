<script lang="ts" setup>
type IconDiscTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

interface Props {
  icon: string
  tone?: IconDiscTone
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'accent',
  size: 36
})

const TONES: Record<IconDiscTone, string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-elev3 text-text-dim'
}

const iconSize = computed(() => `${Math.round(props.size * 0.46)}px`)
</script>

<template>
  <span
    class="shrink-0 inline-flex items-center justify-center rounded-full"
    :class="TONES[props.tone]"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
  >
    <UIcon :name="props.icon" :style="{ width: iconSize, height: iconSize }" />
  </span>
</template>
