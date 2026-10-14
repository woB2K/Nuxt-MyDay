<script lang="ts" setup>
const props = defineProps<{
  open: boolean
  selected: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'apply': [value: string[]]
}>()

const { t } = useI18n()
const { data: tags } = useFinanceTagsQuery()

const selection = ref<string[]>([...props.selected])

watch(() => props.open, (open) => {
  if (open) selection.value = [...props.selected]
})

function toggle(id: string) {
  selection.value = selection.value.includes(id)
    ? selection.value.filter(current => current !== id)
    : [...selection.value, id]
}

function apply() {
  emit('apply', selection.value)
  emit('update:open', false)
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('finance.filters.tags')" @update:open="emit('update:open', $event)">
    <div class="flex flex-wrap gap-2">
      <UiChip
        v-for="tag in tags"
        :key="tag.id"
        :label="tag.name"
        icon="i-lucide-hash"
        :active="selection.includes(tag.id)"
        @click="toggle(tag.id)"
      />
    </div>

    <div class="flex gap-2.5 mt-5">
      <UiButton class="flex-1" variant="secondary" @click="selection = []">
        {{ t('finance.filters.clear') }}
      </UiButton>
      <UiButton class="flex-2" data-testid="tag-filter-apply" @click="apply">
        {{ selection.length ? `${t('finance.filters.show')} · ${selection.length}` : t('finance.filters.showAll') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
