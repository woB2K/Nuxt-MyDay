<script lang="ts" setup>
import type { TransactionFilters, TransactionFilterType } from '~/utils/transactionFilters'
import { hasActiveFilters } from '~/utils/transactionFilters'

const props = defineProps<{ filters: TransactionFilters }>()
const emit = defineEmits<{
  'update:filters': [value: TransactionFilters]
  'openCategories': []
}>()

const { t } = useI18n()

const SEARCH_DEBOUNCE = 300

const typeOptions = computed(() => [
  { value: 'all', label: t('finance.filters.all') },
  { value: 'EXPENSE', label: t('finance.expense'), color: 'var(--c-danger)', inkColor: '#F4F4F7' },
  { value: 'INCOME', label: t('finance.income'), color: 'var(--c-success)', inkColor: '#0F0F14' }
])

const type = computed({
  get: () => props.filters.type,
  set: (value: string) => emit('update:filters', { ...props.filters, type: value as TransactionFilterType })
})

const searching = ref(props.filters.search !== '')
const searchInput = ref(props.filters.search)
const searchField = ref<HTMLInputElement>()

let debounce: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    if (value === props.filters.search) return
    emit('update:filters', { ...props.filters, search: value })
  }, SEARCH_DEBOUNCE)
})

watch(() => props.filters.search, (value) => {
  if (value === searchInput.value) return

  clearTimeout(debounce)
  searchInput.value = value
  searching.value = value !== ''
})

onUnmounted(() => clearTimeout(debounce))

async function openSearch() {
  searching.value = true
  await nextTick()
  searchField.value?.focus()
}

function closeSearch() {
  searching.value = false
  searchInput.value = ''
}

const isActive = computed(() => hasActiveFilters(props.filters))

function reset() {
  searching.value = false
  searchInput.value = ''
  emit('update:filters', { type: 'all', categoryIds: [], search: '' })
}
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <UiPillSelect v-model="type" :options="typeOptions" full />

    <div
      v-if="searching"
      class="flex items-center gap-2.5 h-10 px-3 rounded-full border border-accent bg-elev1 ring-4 ring-accent-soft"
    >
      <UIcon name="i-lucide-search" class="w-4 h-4 text-accent shrink-0" />
      <input
        ref="searchField"
        v-model="searchInput"
        class="flex-1 min-w-0 bg-transparent text-text text-sm outline-none"
        :placeholder="t('finance.filters.searchPlaceholder')"
        type="text"
      >
      <button
        class="shrink-0 w-5.5 h-5.5 flex items-center justify-center rounded-full bg-elev3 text-text-dim"
        type="button"
        @click="closeSearch"
      >
        <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-0.5">
      <UiChip
        :label="t('finance.filters.categories')"
        :count="props.filters.categoryIds.length"
        :active="props.filters.categoryIds.length > 0"
        icon="i-lucide-tag"
        trailing-icon="i-lucide-chevron-down"
        @click="emit('openCategories')"
      />
      <UiChip
        v-if="!searching"
        :label="t('finance.filters.search')"
        icon="i-lucide-search"
        @click="openSearch"
      />
      <button
        v-if="isActive"
        class="shrink-0 h-9 px-2.5 text-[13px] font-semibold text-text-mute"
        type="button"
        @click="reset"
      >
        {{ t('finance.filters.reset') }}
      </button>
    </div>
  </div>
</template>
