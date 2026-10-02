<script lang="ts" setup>
import type { Period } from '~/utils/period'

const { t } = useI18n()

const financeStore = useFinanceStore()
const period = toRef(financeStore, 'period')

const {
  data: pages,
  isPending,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
} = useSavingsQuery(period)

const sheetOpen = ref(false)
const sheetMode = ref<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')
const periodSheetOpen = ref(false)

const summary = computed(() => pages.value?.pages[0])
const entries = computed(() => pages.value?.pages.flatMap(page => page.entries) ?? [])

function openSheet(mode: 'DEPOSIT' | 'WITHDRAWAL') {
  sheetMode.value = mode
  sheetOpen.value = true
}

function applyPeriod(next: Period) {
  financeStore.period = next
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-if="isPending">
      <UiSkeleton class="h-40 rounded-2xl" />
      <UiCard :padding="0" class="overflow-hidden border border-hairline">
        <UiSkeletonRow v-for="n in 5" :key="n" />
      </UiCard>
    </template>

    <template v-else-if="summary">
      <UiSavingsCard
        :balance="summary.balance"
        :delta="summary.delta"
        @add="openSheet('DEPOSIT')"
        @withdraw="openSheet('WITHDRAWAL')"
      />

      <PeriodBar
        class="mt-2"
        :period="financeStore.period"
        @update:period="applyPeriod"
        @open-sheet="periodSheetOpen = true"
      />

      <UiSectionHeader :title="t('finance.savings.history')" :caption="`${summary.total}`" />

      <UiEmptyState
        v-if="entries.length === 0"
        icon="i-lucide-piggy-bank"
        :title="t('finance.savings.noHistory')"
      />

      <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0"
        >
          <div
            class="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            :class="entry.type === 'DEPOSIT' ? 'bg-success/14' : 'bg-warning/14'"
          >
            <UIcon
              :name="entry.type === 'DEPOSIT' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
              class="w-5 h-5"
              :class="entry.type === 'DEPOSIT' ? 'text-success' : 'text-warning'"
            />
          </div>

          <div class="flex flex-col gap-0.5 flex-1 min-w-0">
            <span class="text-text text-sm font-semibold truncate">
              {{ entry.notes || t(`finance.savings.${entry.type === 'DEPOSIT' ? 'deposit' : 'withdrawal'}`) }}
            </span>
            <span class="text-text-dim text-xs">
              {{ entry.type === 'DEPOSIT' ? t('finance.savings.add') : t('finance.savings.withdraw') }} ·
              {{ formatDay(entry.createdAt) }}
            </span>
          </div>

          <span
            class="ml-auto text-sm font-semibold shrink-0"
            :class="entry.type === 'DEPOSIT' ? 'text-success' : 'text-warning'"
          >
            {{ entry.type === 'DEPOSIT' ? '+' : '−' }}{{ formatAmount(entry.amount) }} ₽
          </span>
        </div>
      </UiCard>

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

    <SavingsOpSheet
      v-model:open="sheetOpen"
      :mode="sheetMode"
      :balance="summary?.balance ?? 0"
    />

    <PeriodSheet
      v-model:open="periodSheetOpen"
      :period="financeStore.period"
      @apply="applyPeriod"
    />
  </div>
</template>
