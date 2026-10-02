<script lang="ts" setup>
interface Props {
  w?: number
  h?: number
  r?: number
}

const props = withDefaults(defineProps<Props>(), {
  h: 14,
  r: 6
})
</script>

<template>
  <div
    class="skeleton"
    :style="{
      width: props.w ? `${props.w}px` : '100%',
      height: `${props.h}px`,
      borderRadius: `${props.r}px`
    }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
