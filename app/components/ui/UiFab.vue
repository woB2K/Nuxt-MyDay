<script lang="ts" setup>
defineEmits<{ click: [] }>()

const uiStore = useUiStore()

const style = computed(() => uiStore.toastStackHeight > 0
  ? { transform: `translateY(calc(-${uiStore.toastStackHeight}px - 0.75rem))` }
  : undefined)
</script>

<template>
  <button
    class="fixed right-5 bottom-fab z-30 size-14 rounded-full bg-accent shadow-[0_0_20px_0] shadow-accent/40 flex items-center justify-center active:scale-90 [transition:scale_var(--duration-fast)_var(--ease-spring),transform_var(--duration-base)_var(--ease-spring)]"
    :style="style"
    @click="$emit('click')"
  >
    <UIcon name="i-lucide-plus" class="size-6 text-accent-ink" />
  </button>
</template>
