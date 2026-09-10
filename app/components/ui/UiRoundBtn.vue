<script lang="ts" setup>
interface Props {
  size?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { size: 36, disabled: false })
</script>

<template>
  <button
    class="shrink-0 flex items-center justify-center rounded-full border border-hairline bg-elev1 text-text-dim transition-all duration-fast ease-spring active:bg-elev3 active:scale-[0.94] disabled:opacity-35 disabled:pointer-events-none"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    :disabled="props.disabled"
    type="button"
  >
    <slot />
  </button>
</template>
