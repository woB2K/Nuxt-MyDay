<script lang="ts" setup>
const { data: savings, isPending } = useSavingsQuery()
const { t } = useI18n()

const sheetOpen = ref(false)
const sheetType = ref<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')

function openSheet(type: 'DEPOSIT' | 'WITHDRAWAL') {
  sheetType.value = type
  sheetOpen.value = true
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

    <template v-else-if="savings">
      <UiSavingsCard
        :balance="savings.balance"
        :monthly-delta="savings.thisMonth"
        @add="openSheet('DEPOSIT')"
        @withdraw="openSheet('WITHDRAWAL')"
      />

      <UiSectionHeader :title="t('finance.savings.history')" />

      <UiEmptyState
        v-if="savings.entries.length === 0"
        icon="i-lucide-piggy-bank"
        :title="t('finance.savings.noHistory')"
      />

      <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
        <div
          v-for="entry in savings.entries"
          :key="entry.id"
          class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0"
        >
          <div
            class="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            :class="entry.type === 'DEPOSIT' ? 'bg-success/14' : 'bg-danger/14'"
          >
            <UIcon
              :name="entry.type === 'DEPOSIT' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
              class="w-5 h-5"
              :class="entry.type === 'DEPOSIT' ? 'text-success' : 'text-danger'"
            />
          </div>

          <div class="flex flex-col gap-0.5 flex-1 min-w-0">
            <span class="text-text text-sm font-semibold truncate">
              {{ entry.notes || t(`finance.savings.${entry.type === 'DEPOSIT' ? 'deposit' : 'withdrawal'}`) }}
            </span>
            <span class="text-text-dim text-xs">{{ formatDay(entry.createdAt) }}</span>
          </div>

          <span
            class="ml-auto text-sm font-semibold shrink-0"
            :class="entry.type === 'DEPOSIT' ? 'text-success' : 'text-danger'"
          >
            {{ entry.type === 'DEPOSIT' ? '+' : '-' }}{{ formatAmount(entry.amount) }} ₽
          </span>
        </div>
      </UiCard>
    </template>

    <AddSavingsSheet v-model:open="sheetOpen" :initial-type="sheetType" />
  </div>
</template>
