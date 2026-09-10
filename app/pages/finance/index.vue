<script lang="ts" setup>
const { t } = useI18n()
const register = inject<(fn: (() => void) | null) => void>('registerFabAction')

const tabOptions = computed(() => [
  { value: 'transactions', label: t('finance.tabs.transactions') },
  { value: 'savings', label: t('finance.tabs.savings') }
])

const financeStore = useFinanceStore()

const sheetOpen = ref(false)

function openSheet() {
  sheetOpen.value = true
}

onMounted(() => register?.(openSheet))
onUnmounted(() => register?.(null))
</script>

<template>
  <div class="flex flex-col p-4 gap-3">
    <h1 class="text-3xl font-bold text-text">
      {{ t('finance.title') }}
    </h1>

    <UiPillSelect v-model="financeStore.activeTab" :options="tabOptions" full />

    <FinanceTransactionsTab v-if="financeStore.activeTab === 'transactions'" />
    <FinanceSavingsTab v-if="financeStore.activeTab === 'savings'" />

    <AddTransactionSheet v-model:open="sheetOpen" />
  </div>
</template>
