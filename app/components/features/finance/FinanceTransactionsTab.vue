<script lang="ts" setup>
import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'

const { t } = useI18n()

const financeStore = useFinanceStore()
const period = toRef(financeStore, 'period')
const filters = toRef(financeStore, 'filters')

const { data: summary, isPending: isSummaryPending } = useSummaryQuery(period, filters)
const { data: transactions, isPending: isTransactionsPending } = useTransactionQuery(period, filters)
const { data: categories, isPending: isCategoriesPending } = useCategoriesQuery()

const isPending = computed(() => isTransactionsPending.value || isCategoriesPending.value)

const periodSheetOpen = ref(false)
const categoriesSheetOpen = ref(false)

const net = computed(() => summary.value?.networth ?? 0)

const netFontClass = computed(() => {
  const len = formatAmount(Math.abs(net.value)).length
  if (len > 10) return 'text-[28px]'
  if (len > 7) return 'text-[36px]'
  return 'text-[44px]'
})

const total = computed(() => (summary.value?.income ?? 0) + (summary.value?.expense ?? 0))
const incomePercent = computed(() => (total.value > 0 ? (summary.value!.income / total.value) * 100 : 0))
const expensePercent = computed(() => (total.value > 0 ? (summary.value!.expense / total.value) * 100 : 0))

const maxAmount = computed(() =>
  Math.max(...(summary.value?.breakdown.map(el => el.total) ?? [0]))
)

function applyPeriod(next: Period) {
  financeStore.period = next
}

function applyFilters(next: TransactionFilters) {
  financeStore.filters = next
}

function applyCategories(ids: string[]) {
  financeStore.filters = { ...financeStore.filters, categoryIds: ids }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <PeriodBar
      :period="financeStore.period"
      @update:period="applyPeriod"
      @open-sheet="periodSheetOpen = true"
    />

    <UiSkeletonFinanceHero v-if="isSummaryPending" />
    <div
      v-else
      class="relative overflow-hidden flex flex-col p-6 mb-2 border border-accent-soft rounded-xl bg-gradient-to-b from-accent-soft to-elev1 gap-4"
    >
      <div class="absolute -top-12 -right-8 w-44 h-44 rounded-full bg-accent opacity-[0.06] blur-[30px]" />

      <div class="relative flex flex-col gap-4">
        <span class="text-xs font-semibold uppercase tracking-widest text-text-dim">{{ t('finance.netPeriod') }}</span>
        <span
          class="font-bold leading-none"
          :class="[netFontClass, net < 0 ? 'text-danger' : 'text-text']"
        >{{ net < 0 ? '−' : '' }}{{ formatAmount(Math.abs(net)) }} ₽</span>

        <div class="h-2.5 flex rounded-full overflow-hidden gap-0.5 bg-white/6">
          <div
            class="h-full bg-success rounded-full transition-[width] duration-500"
            :style="{ width: `${incomePercent}%` }"
          />
          <div
            class="h-full bg-danger rounded-full transition-[width] duration-500"
            :style="{ width: `${expensePercent}%` }"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-center">
            <span class="inline-block w-2 h-2 rounded-full bg-success" />
            <span class="text-text-dim text-xs">{{ t('finance.income') }}</span>
            <span class="text-text font-semibold text-sm">{{ formatAmount(summary?.income ?? 0) }} ₽</span>
          </div>
          <div class="flex gap-2 items-center">
            <span class="inline-block w-2 h-2 rounded-full bg-danger" />
            <span class="text-text-dim text-xs">{{ t('finance.expense') }}</span>
            <span class="text-text font-semibold text-sm">{{ formatAmount(summary?.expense ?? 0) }} ₽</span>
          </div>
        </div>
      </div>
    </div>

    <FilterBar
      :filters="financeStore.filters"
      @update:filters="applyFilters"
      @open-categories="categoriesSheetOpen = true"
    />

    <template v-if="isPending">
      <UiCard :padding="0" class="overflow-hidden border border-hairline">
        <UiSkeletonRow v-for="n in 8" :key="n" />
      </UiCard>
    </template>

    <template v-else-if="summary && transactions && categories">
      <UiSectionHeader :title="t('finance.breakdown')" />
      <UiEmptyState
        v-if="summary.breakdown.length === 0"
        icon="i-lucide-chart-pie"
        :title="t('finance.noBreakdown')"
      />
      <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
        <UiCategoryBar
          v-for="item in summary.breakdown"
          :key="item.category.id"
          :total-amount="summary.expense"
          :max-amount="maxAmount"
          :amount="item.total"
          :category="item.category"
        />
      </UiCard>

      <UiSectionHeader :title="t('finance.recent')" :caption="`${transactions.total}`" />
      <UiEmptyState
        v-if="transactions.data.length === 0"
        :icon="financeStore.filtersActive ? 'i-lucide-search-x' : 'i-lucide-receipt'"
        :title="financeStore.filtersActive ? t('finance.filters.noResults') : t('finance.noTransactions')"
        :subtitle="financeStore.filtersActive ? t('finance.filters.noResultsSub') : undefined"
      >
        <template v-if="financeStore.filtersActive" #action>
          <UiButton size="sm" variant="secondary" @click="financeStore.resetFilters()">
            {{ t('finance.filters.clearFilters') }}
          </UiButton>
        </template>
      </UiEmptyState>
      <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
        <UiTxRow
          v-for="tx in transactions.data"
          :key="tx.id"
          :category="categories.find(c => c.id === tx.categoryId)!"
          :transaction="tx"
        />
      </UiCard>
    </template>

    <PeriodSheet
      v-model:open="periodSheetOpen"
      :period="financeStore.period"
      @apply="applyPeriod"
    />

    <CategoryFilterSheet
      v-model:open="categoriesSheetOpen"
      :selected="financeStore.filters.categoryIds"
      @apply="applyCategories"
    />
  </div>
</template>
