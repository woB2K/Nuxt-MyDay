import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('finance', () => {
  const currentMonth = ref<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')

  return {
    currentMonth,
    activeTab
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFinanceStore, import.meta.hot))
}
