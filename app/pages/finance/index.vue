<script lang="ts" setup>
import type { TransactionItem } from '~~/shared/types'
import { useFabAction } from '~/composables/useFabAction'

const { t } = useI18n()

const tabOptions = computed(() => [
  { value: 'transactions', label: t('finance.tabs.transactions') },
  { value: 'savings', label: t('finance.tabs.savings') }
])

const financeStore = useFinanceStore()
const { members, isFamily } = useFamily()

const sheetOpen = ref(false)
const editing = ref<TransactionItem | null>(null)

function openSheet(transaction: TransactionItem | null = null) {
  editing.value = transaction
  sheetOpen.value = true
}

useFabAction(() => openSheet())
</script>

<template>
  <div class="flex flex-col p-4 gap-3">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-bold text-text">
        {{ t('finance.title') }}
      </h1>
      <NuxtLink
        v-if="isFamily"
        to="/settings/family"
        class="flex items-center min-h-11 px-1"
        :aria-label="t('family.screen.title')"
        data-testid="finance-family"
      >
        <UiAvatarStack :members="members" :size="28" />
      </NuxtLink>
    </div>

    <UiPillSelect v-model="financeStore.activeTab" :options="tabOptions" full />

    <FinanceTransactionsTab v-if="financeStore.activeTab === 'transactions'" @edit="openSheet" />
    <FinanceSavingsTab v-if="financeStore.activeTab === 'savings'" />

    <TransactionEditSheet v-model:open="sheetOpen" :transaction="editing" />
  </div>
</template>
