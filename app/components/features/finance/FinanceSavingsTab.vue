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

const { mutate: deleteEntry } = useDeleteSavingsMutation()

type SavingsMode = SavingsEntryItem['type']

const entryLooks = {
  DEPOSIT: { icon: 'i-lucide-arrow-up', tile: 'bg-success/14', ink: 'text-success', sign: '+', title: 'finance.savings.deposit', caption: 'finance.savings.add' },
  WITHDRAWAL: { icon: 'i-lucide-arrow-down', tile: 'bg-warning/14', ink: 'text-warning', sign: '−', title: 'finance.savings.withdrawal', caption: 'finance.savings.withdraw' },
  OPENING: { icon: 'i-lucide-flag', tile: 'bg-accent-soft', ink: 'text-accent', sign: '', title: 'finance.savings.opening', caption: 'finance.savings.startPoint' }
} as const

const sheetOpen = ref(false)
const sheetMode = ref<SavingsMode>('DEPOSIT')
const periodSheetOpen = ref(false)

const summary = computed(() => pages.value?.pages[0])
const entries = computed(() => pages.value?.pages.flatMap(page => page.entries) ?? [])

function openSheet(mode: SavingsMode) {
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

      <button
        v-if="summary.opening === null"
        class="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-accent"
        type="button"
        @click="openSheet('OPENING')"
      >
        <UIcon name="i-lucide-flag" class="w-4 h-4" />
        {{ t('finance.savings.setOpening') }}
      </button>

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
        <template v-for="(entry, index) in entries" :key="entry.id">
          <div v-if="index > 0" class="h-px ml-[66px] bg-hairline" />
          <UiSwipeRow @delete="deleteEntry(entry.id)">
            <div class="flex items-center gap-3 p-4">
              <div
                class="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                :class="entryLooks[entry.type].tile"
              >
                <UIcon
                  :name="entryLooks[entry.type].icon"
                  class="w-5 h-5"
                  :class="entryLooks[entry.type].ink"
                />
              </div>

              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <span class="text-text text-sm font-semibold truncate">
                  {{ entry.notes || t(entryLooks[entry.type].title) }}
                </span>
                <span class="text-text-dim text-xs">
                  {{ t(entryLooks[entry.type].caption) }} ·
                  {{ formatDay(entry.createdAt) }}
                </span>
              </div>

              <span
                class="ml-auto text-sm font-semibold shrink-0"
                :class="entryLooks[entry.type].ink"
              >
                {{ entryLooks[entry.type].sign }}{{ formatAmount(entry.amount) }} ₽
              </span>
            </div>
          </UiSwipeRow>
        </template>
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
