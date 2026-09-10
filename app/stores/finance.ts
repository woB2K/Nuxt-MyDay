import type { Period } from '~/utils/period'
import { defineStore } from 'pinia'
import { periodPresets } from '~/utils/period'

export const useFinanceStore = defineStore('finance', () => {
  const period = ref<Period>(periodPresets.thisMonth())
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')

  return {
    period,
    activeTab
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFinanceStore, import.meta.hot))
}
