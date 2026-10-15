<script lang="ts" setup>
const props = defineProps<{
  icon: string
  color: string
  value: string | number
  label: string
}>()
</script>

<template>
  <div class="relative min-w-0 rounded-lg border border-hairline bg-elev1 px-3 pt-3 pb-[11px]">
    <span class="flex" :style="{ color: props.color }">
      <UIcon :name="props.icon" class="size-4" />
    </span>
    <div class="mt-2 font-display text-2xl leading-7 font-bold tracking-[-0.02em] tabular-nums text-text">
      {{ props.value }}
    </div>
    <div class="mt-0.5 text-xs leading-4 font-medium text-text-mute">
      {{ props.label }}
    </div>
    <slot />
  </div>
</template>
