<script lang="ts" setup>
const { t } = useI18n()

const financeStore = useFinanceStore()
const currentMonth = toRef(financeStore, 'currentMonth')

const { data: summary, isPending: isSummaryPending } = useSummaryQuery(currentMonth)
const { data: transactions, isPending: isTransactionsPending } = useTransactionQuery()
const { data: categories, isPending: isCategoriesPending } = useCategoriesQuery()

const isPending = computed(() => isSummaryPending.value || isTransactionsPending.value || isCategoriesPending.value)

const maxAmount = computed(() =>
  Math.max(...(summary.value?.breakdown.map(el => el.total) ?? [0]))
)
</script>

<template>
  <template v-if="isPending">
    <UiCard :padding="0" class="overflow-hidden border border-hairline">
      <UiSkeletonRow v-for="n in 8" :key="n" />
    </UiCard>
  </template>

  <template v-else-if="summary && transactions && categories">
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
