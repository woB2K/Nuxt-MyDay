<script lang="ts" setup>
import type { CategoryInfo } from '~~/shared/types'

interface Props {
  category: CategoryInfo
  amount: number
  maxAmount: number
  totalAmount: number
}

const props = defineProps<Props>()

const barWidth = computed(() => `${Math.round((props.amount / props.maxAmount) * 100)}%`)
const percentage = computed(() => Math.round((props.amount / props.totalAmount) * 100))
</script>

<template>
  <div class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0">
    <div
      class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      :style="{ backgroundColor: `${props.category.color}26` }"
    >
      <UIcon
        :name="props.category.icon"
        class="w-5 h-5"
        :style="{ color: props.category.color }"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-2">
        <span class="text-text text-sm font-medium truncate">{{ props.category.name }}</span>
        <span class="text-text-dim text-xs shrink-0">{{ percentage }}%</span>
      </div>
      <div class="h-1 rounded-full bg-elev-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-[width] duration-500"
          :style="{ width: barWidth, backgroundColor: props.category.color }"
        />
      </div>
    </div>

    <span class="text-text text-sm font-semibold shrink-0 tabular-nums">
      {{ formatAmount(props.amount) }} ₽
    </span>
  </div>
</template>
