<script lang="ts" setup>
import type { Consequence } from '~/utils/family'

const props = defineProps<{ items: Consequence[] }>()
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-hairline bg-elev1">
    <div
      v-for="(item, index) in props.items"
      :key="item.title"
      class="flex items-start gap-3 px-4 py-3.5 animate-step-in"
      :class="{ 'border-t border-hairline': index > 0 }"
      :style="{ animationDelay: `${index * 40}ms` }"
    >
      <UiIconDisc :icon="item.icon" :tone="item.tone" :size="32" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="text-[15px] font-semibold text-text">{{ item.title }}</span>
        <span v-if="item.sub" class="text-[13px] leading-[18px] text-text-dim">{{ item.sub }}</span>
      </div>
    </div>
  </div>
</template>
