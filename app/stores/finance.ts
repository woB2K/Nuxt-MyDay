import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { defineStore } from 'pinia'
import { periodPresets } from '~/utils/period'
import { emptyFilters, hasActiveFilters } from '~/utils/transactionFilters'

interface CategoryDrill {
  categoryId: string
  previous: string[]
}

export const useFinanceStore = defineStore('finance', () => {
  const period = ref<Period>(periodPresets.thisMonth())
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')
  const filters = ref<TransactionFilters>(emptyFilters())
  const drill = ref<CategoryDrill | null>(null)

  const filtersActive = computed(() => hasActiveFilters(filters.value))

  function resetFilters() {
    filters.value = emptyFilters()
    drill.value = null
  }

  function drillIntoCategory(categoryId: string) {
    drill.value = { categoryId, previous: filters.value.categoryIds }
    filters.value = { ...filters.value, categoryIds: [categoryId] }
  }

  function leaveDrill() {
    if (!drill.value) return

    const { categoryId, previous } = drill.value
    drill.value = null

    const { categoryIds } = filters.value
    if (categoryIds.length === 1 && categoryIds[0] === categoryId) {
      filters.value = { ...filters.value, categoryIds: previous }
    }
  }

  return {
    period,
    activeTab,
    filters,
    drill,
    filtersActive,
    resetFilters,
    drillIntoCategory,
    leaveDrill
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFinanceStore, import.meta.hot))
}
