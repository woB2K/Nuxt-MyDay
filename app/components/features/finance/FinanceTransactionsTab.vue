<script lang="ts" setup>
import type { Category, Transaction } from '~~/prisma/.generated/prisma'

interface Props {
  summary: SummaryResponse
  transactions: Transaction[]
  categories: Category[]
}

const props = defineProps<Props>()

const { t } = useI18n()

const maxAmount = computed(() =>
  Math.max(...props.summary.breakdown.map(el => el.total))
)
</script>

<template>
  <UiSectionHeader :title="t('finance.breakdown')" />
  <UiCard :padding="0" class="overflow-hidden border border-hairline">
    <UiCategoryBar
      v-for="item in props.summary.breakdown"
      :key="item.category.id"
      :total-amount="summary.expense"
      :max-amount="maxAmount"
      :amount="item.total"
      :category="item.category"
    />
  </UiCard>
  <UiSectionHeader :title="t('finance.recent')" />
  <UiCard :padding="0" class="overflow-hidden border border-hairline">
    <UiTxRow
      v-for="tx in props.transactions"
      :key="tx.id"
      :category="props.categories.find(c => c.id === tx.categoryId)!"
      :transaction="tx"
    />
  </UiCard>
</template>
