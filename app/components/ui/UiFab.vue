<script lang="ts" setup>
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="fixed right-5 bottom-[100px] size-14 rounded-full bg-accent shadow-[0_0_20px_0] shadow-accent/40 flex items-center justify-center active:scale-90 transition-transform duration-150"
    @click="$emit('click')"
  >
    <UIcon name="i-lucide-plus" class="size-6 text-white" />
  </button>
</template>
