<script lang="ts" setup>
import FinanceTransactionsTab from '~/components/features/finance/FinanceTransactionsTab.vue'

const { t, locale } = useI18n()

const financeStore = useFinanceStore()
const mount = toRef(financeStore, 'currentMonth')
const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'long' })
    .format(financeStore.currentMonth)
)

const { data: summary } = useSummaryQuery(mount)
const { data: transaction } = useTransactionQuery()
const { data: categories } = useCategoriesQuery()

const tabOptions = computed(() => [
  { value: 'transactions', label: t('finance.tabs.transactions') },
  { value: 'savings', label: t('finance.tabs.savings') },
  { value: 'budgets', label: t('finance.tabs.budgets') }
])
const total = computed(() => (summary.value?.income ?? 0) + (summary.value?.expense ?? 0))
const incomePercent = computed(() =>
  total.value > 0 ? (summary.value!.income / total.value) * 100 : 0
)
const expensePercent = computed(() =>
  total.value > 0 ? (summary.value!.expense / total.value) * 100 : 0
)
</script>

<template>
  <div class="flex flex-col p-4 gap-2">
    <h1 class="text-3xl font-bold text-text">
      {{ t('finance.title') }}
    </h1>
    <span class="text-xl text-text-dim">{{ monthLabel }}</span>

    <div class="flex flex-col p-4 mb-2 border border-hairline rounded-2xl bg-gradient-to-b from-accent-soft to-elev1 gap-4">
      <span class="text-xs font-semibold uppercase tracking-widest text-text-mute">{{ t('finance.balance') }}</span>
      <span class="text-text text-[52px] font-bold leading-none">{{ formatAmount(summary?.networth ?? 0) }} ₽</span>

      <div class="h-2 flex rounded-full overflow-hidden gap-0.5">
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
          <span class="text-text-dim text-sm">{{ t('finance.income') }}</span>
          <span class="text-text font-semibold">{{ formatAmount(summary?.income ?? 0) }} ₽</span>
        </div>
        <div class="flex gap-2 items-center">
          <span class="inline-block w-2 h-2 rounded-full bg-danger" />
          <span class="text-text-dim text-sm">{{ t('finance.expense') }}</span>
          <span class="text-text font-semibold">{{ formatAmount(summary?.expense ?? 0) }} ₽</span>
        </div>
      </div>
    </div>
    <UiPillSelect v-model="financeStore.activeTab" :options="tabOptions" full />

    <FinanceTransactionsTab
      v-if="summary && categories && financeStore.activeTab === 'transactions'"
      :summary="summary"
      :transactions="transaction?.data ?? []"
      :categories="categories"
    />

    <UiEmptyState v-else icon="i-heroicons-document" />
  </div>
</template>
