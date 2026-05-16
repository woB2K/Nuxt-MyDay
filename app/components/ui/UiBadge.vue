<script lang="ts" setup>
interface Props {
  color?: 'accent' | 'success' | 'danger' | 'info' | 'neutral' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'accent'
})

const color = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success/14 text-success',
  danger: 'bg-danger/14 text-danger',
  info: 'bg-info/14 text-info',
  neutral: 'bg-elev3 text-text-dim',
  warning: 'bg-warning/14 text-warning'
}
</script>

<template>
  <div
    class="p-2 rounded-lg text-sm border"
    :class="color[props.color]"
  >
    <slot />
  </div>
</template>
