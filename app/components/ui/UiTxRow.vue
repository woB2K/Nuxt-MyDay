<script lang="ts" setup>
import type { Category, Transaction } from '~~/prisma/.generated/prisma'

interface Props {
  transaction: Transaction
  category: Category
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0">
    <div
      class="w-10 h-10 rounded-md flex items-center justify-center"
      :style="{ backgroundColor: `${props.category.color}33` }"
    >
      <UIcon
        :name="props.category.icon"
        :style="{ color: `${props.category.color}`}"
        class="w-5 h-5"
      />
    </div>
    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <span class="text-text text-sm font-semibold">{{ props.transaction.notes || props.category.name }}</span>
      <span class="text-text-dim text-xs">{{ props.category.name }} · {{ formatDay(props.transaction.date) }}</span>
    </div>
    <span
      class="ml-auto text-sm font-semibold truncate"
      :class="props.transaction.type === 'INCOME' ? 'text-success' : 'text-text'"
    >
      {{ props.transaction.type === 'INCOME' ? '+' : '-' }}{{ formatAmount(props.transaction.amount) }} ₽
    </span>
  </div>
</template>
