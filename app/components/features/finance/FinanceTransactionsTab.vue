<script lang="ts" setup>
import type { Category, Transaction } from '~~/prisma/.generated/prisma'

interface Props {
  summary: SummaryResponse
  transactions: Transaction[]
  categories: Category[]
}

const props = defineProps<Props>()
const maxAmount = computed(() =>
  Math.max(...props.summary.breakdown.map(el => el.total))
)
const breakdownWithCategory = computed(() =>
  props.summary.breakdown.map(item => ({
    ...item,
    category: props.categories.find(c => c.id === item.categoryId)!
  }))
)

</script>

<template>
  <UiSectionHeader title="По категориям" />
  <UiCard :padding="0" class="overflow-hidden border border-hairline">
    <UiCategoryBar
      v-for="item in breakdownWithCategory"
      :key="item.categoryId"
      :total-amount="summary.expense"
      :max-amount="maxAmount"
      :amount="item.total"
      :category="item.category"
    />
  </UiCard>
  <UiSectionHeader title="Транзакции" />
  <UiCard :padding="0" class="overflow-hidden border border-hairline">
    <UiTxRow
      v-for="tx in props.transactions"
      :key="tx.id"
      :category="props.categories.find(c => c.id === tx.categoryId)!"
      :transaction="tx"
    />
  </UiCard>
</template>
