<script lang="ts" setup>
import type { TransactionItem } from '~~/shared/types'
import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { fromDateString, toDateString } from '~/utils/formatDate'
import { groupByDay } from '~/utils/transactionGroups'

definePageMeta({ hideFab: true })

const { t, locale } = useI18n()

const financeStore = useFinanceStore()
const period = toRef(financeStore, 'period')
const filters = toRef(financeStore, 'filters')

const { data: summary } = useSummaryQuery(period, filters)
const { data: categories } = useCategoriesQuery()
const {
  data: pages,
  isPending,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
} = useTransactionPagesQuery(period, filters)

const { mutate: deleteTransaction } = useDeleteTransactionMutation()

const periodSheetOpen = ref(false)
const categoriesSheetOpen = ref(false)
const editSheetOpen = ref(false)
const editing = ref<TransactionItem | null>(null)

const editAction = computed(() => ({
  label: t('general.edit'),
  icon: 'i-lucide-pencil',
  gradient: 'linear-gradient(90deg, var(--c-accent) 0%, var(--c-accent-soft) 100%)',
  inkColor: 'var(--c-accent-ink)'
}))

function openEdit(transaction: TransactionItem) {
  editing.value = transaction
  editSheetOpen.value = true
}

const transactions = computed(() => pages.value?.pages.flatMap(page => page.data) ?? [])
const total = computed(() => pages.value?.pages[0]?.total ?? 0)

const groups = computed(() => groupByDay(transactions.value))

const relativeDays = computed(() => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return { today: toDateString(), yesterday: toDateString(yesterday) }
})

function dayLabel(day: string): string {
  if (day === relativeDays.value.today) return t('finance.today')
  if (day === relativeDays.value.yesterday) return t('finance.yesterday')

  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', weekday: 'short' })
    .format(fromDateString(day))
}

function categoryOf(tx: TransactionItem) {
  return categories.value?.find(category => category.id === tx.categoryId)
}

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
  <div class="flex flex-col p-4 gap-3">
    <UiRoundBtn class="mb-1" @click="navigateTo('/finance')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('finance.allTransactions') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('finance.ops', { count: total }, total) }}</span>
    </div>

    <PeriodBar
      :period="financeStore.period"
      @update:period="applyPeriod"
      @open-sheet="periodSheetOpen = true"
    />

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

    <template v-else-if="transactions.length === 0">
      <UiEmptyState
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
    </template>

    <template v-else>
      <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-hairline bg-elev2">
        <span class="flex-1 text-xs font-semibold text-text-dim">{{ t('finance.ops', { count: total }, total) }}</span>
        <span v-if="summary && summary.income > 0" class="text-[13px] font-semibold text-success">
          +{{ formatAmount(summary.income) }} ₽
        </span>
        <span v-if="summary && summary.expense > 0" class="text-[13px] font-semibold text-danger">
          −{{ formatAmount(summary.expense) }} ₽
        </span>
      </div>

      <div v-for="group in groups" :key="group.day" class="flex flex-col">
        <div class="sticky top-0 z-10 flex items-center justify-between px-1 py-2 bg-bg">
          <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
            {{ dayLabel(group.day) }}
          </span>
          <span
            class="text-xs font-semibold"
            :class="group.net >= 0 ? 'text-success' : 'text-text-mute'"
          >
            {{ group.net >= 0 ? '+' : '−' }}{{ formatAmount(Math.abs(group.net)) }} ₽
          </span>
        </div>

        <div class="overflow-hidden rounded-2xl border border-hairline bg-elev1">
          <template v-for="(tx, index) in group.items" :key="tx.id">
            <div v-if="index > 0" class="h-px ml-[66px] bg-hairline" />
            <UiSwipeRow
              :right-action="editAction"
              @complete="openEdit(tx)"
              @delete="deleteTransaction(tx.id)"
            >
              <UiTxRow
                v-if="categoryOf(tx)"
                class="cursor-pointer"
                :category="categoryOf(tx)!"
                :transaction="tx"
                :show-date="false"
                @click="openEdit(tx)"
              />
            </UiSwipeRow>
          </template>
        </div>
      </div>

      <UiButton
        v-if="hasNextPage"
        class="w-full mt-2"
        variant="secondary"
        size="md"
        :loading="isFetchingNextPage"
        @click="fetchNextPage()"
      >
        {{ t('finance.loadMore') }}
      </UiButton>
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

    <TransactionEditSheet v-model:open="editSheetOpen" :transaction="editing" />
  </div>
</template>
