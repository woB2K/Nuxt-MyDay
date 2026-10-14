<script lang="ts" setup>
import type { TransactionFilters, TransactionFilterType } from '~/utils/transactionFilters'
import { emptyFilters, hasActiveFilters } from '~/utils/transactionFilters'

const props = defineProps<{ filters: TransactionFilters }>()
const emit = defineEmits<{
  'update:filters': [value: TransactionFilters]
  'openCategories': []
}>()

const { t } = useI18n()
const { myId, members, isFamily } = useFamily()
const { data: tags } = useFinanceTagsQuery()

const tagSheetOpen = ref(false)
const authorSheetOpen = ref(false)
const showTags = computed(() => (tags.value?.length ?? 0) > 0 || props.filters.tagIds.length > 0)

function applyTags(tagIds: string[]) {
  emit('update:filters', { ...props.filters, tagIds })
}

const showAuthor = computed(() => isFamily.value || props.filters.authorId !== null)
const author = computed(() => members.value.find(member => member.userId === props.filters.authorId))

const authorLabel = computed(() => {
  if (props.filters.authorId === null) return t('family.finance.members')
  if (props.filters.authorId === myId.value) return t('family.finance.mine')
  return author.value?.name ?? t('family.formerMember')
})

function applyAuthor(authorId: string | null) {
  emit('update:filters', { ...props.filters, authorId })
}

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
  emit('update:filters', emptyFilters())
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

    <div class="flex items-start">
      <div
        class="flex-1 min-w-0 flex gap-2 overflow-x-auto pb-0.5 after:w-3 after:shrink-0 [mask-image:linear-gradient(to_right,#000_calc(100%-1.25rem),transparent)]"
      >
        <UiChip
          v-if="showAuthor"
          :label="authorLabel"
          :active="props.filters.authorId !== null"
          icon="i-lucide-users"
          trailing-icon="i-lucide-chevron-down"
          data-testid="filter-author"
          @click="authorSheetOpen = true"
        >
          <template v-if="author" #leading>
            <UiAvatar :name="author.name" :color-index="author.colorIndex" :size="20" />
          </template>
        </UiChip>
        <UiChip
          :label="t('finance.filters.categories')"
          :count="props.filters.categoryIds.length"
          :active="props.filters.categoryIds.length > 0"
          icon="i-lucide-tag"
          trailing-icon="i-lucide-chevron-down"
          @click="emit('openCategories')"
        />
        <UiChip
          v-if="showTags"
          :label="t('finance.filters.tags')"
          :count="props.filters.tagIds.length"
          :active="props.filters.tagIds.length > 0"
          icon="i-lucide-hash"
          trailing-icon="i-lucide-chevron-down"
          data-testid="filter-tags"
          @click="tagSheetOpen = true"
        />
        <UiChip
          v-if="!searching"
          :label="t('finance.filters.search')"
          icon="i-lucide-search"
          @click="openSearch"
        />
      </div>
      <button
        v-if="isActive"
        class="shrink-0 h-9 pl-1.5 pr-1 text-[13px] font-semibold text-text-mute"
        type="button"
        @click="reset"
      >
        {{ t('finance.filters.reset') }}
      </button>
    </div>

    <TagFilterSheet v-model:open="tagSheetOpen" :selected="props.filters.tagIds" @apply="applyTags" />
    <AuthorFilterSheet v-model:open="authorSheetOpen" :selected="props.filters.authorId" @apply="applyAuthor" />
  </div>
</template>
