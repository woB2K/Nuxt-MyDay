<script lang="ts" setup>
interface Props {
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 40
})
</script>

<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 40 40">
    <defs>
      <linearGradient id="ml1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#A78BFA" />
        <stop offset="100%" stop-color="#5EEAD4" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#ml1)" />
    <path
      d="M10 28V14l5 8 5-8v14M22 22l3 3 6-7" stroke="#0F0F14" stroke-width="2.5" fill="none" stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
