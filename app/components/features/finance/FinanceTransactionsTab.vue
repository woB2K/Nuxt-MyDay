<script lang="ts" setup>
const { t } = useI18n()

const financeStore = useFinanceStore()
const currentMonth = toRef(financeStore, 'currentMonth')

const { data: summary } = useSummaryQuery(currentMonth)
const { data: transactions } = useTransactionQuery()
const { data: categories } = useCategoriesQuery()

const maxAmount = computed(() =>
  Math.max(...(summary.value?.breakdown.map(el => el.total) ?? [0]))
)
</script>

<template>
  <template v-if="summary && transactions && categories">
    <UiSectionHeader :title="t('finance.breakdown')" />
    <UiCard :padding="0" class="overflow-hidden border border-hairline">
      <UiCategoryBar
        v-for="item in summary.breakdown"
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
        v-for="tx in transactions.data"
        :key="tx.id"
        :category="categories.find(c => c.id === tx.categoryId)!"
        :transaction="tx"
      />
    </UiCard>
  </template>
</template>
