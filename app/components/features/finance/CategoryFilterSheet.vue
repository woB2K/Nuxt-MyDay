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
const { data: categories } = useCategoriesQuery()

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
  <UiSheet :open="props.open" :title="t('finance.filters.categories')" @update:open="emit('update:open', $event)">
    <div class="flex flex-col gap-2">
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors duration-fast cursor-pointer"
        :class="selection.includes(category.id) ? 'bg-accent-soft border-accent' : 'bg-elev2 border-hairline'"
        @click="toggle(category.id)"
      >
        <span
          class="w-9 h-9 shrink-0 flex items-center justify-center rounded-[10px]"
          :style="{ backgroundColor: `${category.color}22` }"
        >
          <UIcon :name="category.icon" class="w-4.5 h-4.5" :style="{ color: category.color }" />
        </span>
        <span class="flex-1 text-left text-[15px] font-semibold text-text truncate">{{ category.name }}</span>
        <span class="text-xs text-text-mute">
          {{ category.type === 'INCOME' ? t('finance.income') : t('finance.expense') }}
        </span>
        <span @click.stop>
          <UiCheckCircle
            :model-value="selection.includes(category.id)"
            :size="22"
            @update:model-value="toggle(category.id)"
          />
        </span>
      </div>
    </div>

    <div class="flex gap-2.5 mt-4">
      <UiButton class="flex-1" variant="secondary" @click="selection = []">
        {{ t('finance.filters.clear') }}
      </UiButton>
      <UiButton class="flex-2" @click="apply">
        {{ selection.length ? `${t('finance.filters.show')} · ${selection.length}` : t('finance.filters.showAll') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
