<script lang="ts" setup>
const { t } = useI18n()
const { pending } = useOutbox()
const { data: categories } = useCategoriesQuery()
const { authorFor } = useFamily()
const tagNamesOf = useFinanceTagNames()

const unknownCategory = computed(() => ({ icon: 'i-lucide-receipt', color: '#8A8A98', name: t('finance.category'), key: null }))

function categoryOf(id: string) {
  return categories.value?.find(category => category.id === id) ?? unknownCategory.value
}
</script>

<template>
  <div v-if="pending.length" class="flex flex-col" data-testid="outbox-pending">
    <UiSectionHeader :title="t('outbox.title')" :caption="`${pending.length}`" />
    <span class="-mt-2 px-5 pb-3 text-xs text-text-mute">{{ t('outbox.hint') }}</span>
    <UiCard :padding="0" class="overflow-hidden border border-hairline">
      <UiTxRow
        v-for="entry in pending"
        :key="entry.id"
        :transaction="entry.body"
        :category="categoryOf(entry.body.categoryId)"
        :author="authorFor(entry.userId)"
        :tags="tagNamesOf(entry.body.tagIds ?? [])"
        pending
      />
    </UiCard>
  </div>
</template>
