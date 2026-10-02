<script lang="ts" setup>
interface Props {
  title: string
  caption?: string
}

defineProps<Props>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex items-center justify-between pt-5 pb-3 px-5">
    <div class="flex items-center gap-1">
      <span class="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-dim">
        {{ title }}
      </span>
      <span v-if="caption" class="text-[13px] text-text-dim">
        {{ caption }}
      </span>
    </div>
    <slot name="action" />
  </div>
</template>
