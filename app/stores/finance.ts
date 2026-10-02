import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { defineStore } from 'pinia'
import { periodPresets } from '~/utils/period'
import { emptyFilters, hasActiveFilters } from '~/utils/transactionFilters'

export const useFinanceStore = defineStore('finance', () => {
  const period = ref<Period>(periodPresets.thisMonth())
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')
  const filters = ref<TransactionFilters>(emptyFilters())

  const filtersActive = computed(() => hasActiveFilters(filters.value))

  function resetFilters() {
    filters.value = emptyFilters()
  }

  return {
    period,
    activeTab,
    filters,
    filtersActive,
    resetFilters
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFinanceStore, import.meta.hot))
}
