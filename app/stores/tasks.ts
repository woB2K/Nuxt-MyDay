import type { TaskFilter } from '~/utils/taskFilters'
import { defineStore } from 'pinia'
import { defaultTaskFilter, hasActiveTaskFilters } from '~/utils/taskFilters'

export const useTasksStore = defineStore('tasks', () => {
  const activeFilter = ref<TaskFilter>(defaultTaskFilter)
  const searchQuery = ref('')

  const filtersActive = computed(() => hasActiveTaskFilters(activeFilter.value, searchQuery.value))

  function resetFilters() {
    activeFilter.value = defaultTaskFilter
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
