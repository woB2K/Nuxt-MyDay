import type { TaskFilter } from '~/utils/taskFilters'
import { defineStore } from 'pinia'
import { hasActiveTaskFilters } from '~/utils/taskFilters'

export const useTasksStore = defineStore('tasks', () => {
  const activeFilter = ref<TaskFilter>('all')
  const searchQuery = ref('')

  const filtersActive = computed(() => hasActiveTaskFilters(activeFilter.value, searchQuery.value))

  function resetFilters() {
    activeFilter.value = 'all'
    searchQuery.value = ''
  }

  return {
    activeFilter,
    searchQuery,
    filtersActive,
    resetFilters
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}
