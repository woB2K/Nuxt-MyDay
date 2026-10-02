<script lang="ts" setup>
import type { TaskFilter } from '~/utils/taskFilters'
import { taskFilterKeys } from '~/utils/taskFilters'

const props = defineProps<{ filter: TaskFilter, search: string }>()

const emit = defineEmits<{
  'update:filter': [value: TaskFilter]
  'update:search': [value: string]
}>()

const { t } = useI18n()

const SEARCH_DEBOUNCE = 300

const filterOptions = computed(() => taskFilterKeys.map(key => ({
  value: key,
  label: t(`tasks.filters.${key}`)
})))

const filterValue = computed({
  get: () => props.filter as string,
  set: (value: string) => emit('update:filter', value as TaskFilter)
})

const searchInput = ref(props.search)

let debounce: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    if (value === props.search) return

    emit('update:search', value)
  }, SEARCH_DEBOUNCE)
})

watch(() => props.search, (value) => {
  if (value === searchInput.value) return

  clearTimeout(debounce)
  searchInput.value = value
})

onUnmounted(() => clearTimeout(debounce))
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div
      class="flex items-center gap-2.5 h-10 px-3 rounded-full border bg-elev1"
      :class="searchInput ? 'border-accent ring-4 ring-accent-soft' : 'border-hairline'"
    >
      <UIcon
        name="i-lucide-search"
        class="w-4 h-4 shrink-0"
        :class="searchInput ? 'text-accent' : 'text-text-mute'"
      />
      <input
        v-model="searchInput"
        class="flex-1 min-w-0 bg-transparent text-text text-sm outline-none"
        :placeholder="t('tasks.filters.searchPlaceholder')"
        type="text"
      >
      <button
        v-if="searchInput"
        class="shrink-0 w-5.5 h-5.5 flex items-center justify-center rounded-full bg-elev3 text-text-dim"
        type="button"
        @click="searchInput = ''"
      >
        <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <UiPillSelect v-model="filterValue" :options="filterOptions" full />
  </div>
</template>
