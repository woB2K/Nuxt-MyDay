<script lang="ts" setup>
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()

const currentTypeCategory = ref<'INCOME' | 'EXPENSE'>('EXPENSE')
const amount = ref()
const note = ref<string>()
const pillOptions = [{
  value: 'EXPENSE',
  label: `↓ ${t('finance.expense')}`,
  color: 'var(--c-danger)',
  inkColor: '#F4F4F7'
},
{
  value: 'INCOME',
  label: `↑ ${t('finance.income')}`,
  color: 'var(--c-success)',
  inkColor: '#0F0F14'
}]

const { data: categories } = useCategoriesQuery()

const filteredCategories = computed(() => {
  return categories.value?.filter(c => c.type === currentTypeCategory.value)
})
const selectedCategory = ref()

function addTransaction() {
  console.log('hi lol')
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('finance.adTransaction')" @update:open="emit('update:open', $event)">
    <form class="flex flex-col items-center gap-5" @submit.prevent="addTransaction">
      <UiPillSelect
        v-model="currentTypeCategory"
        :options="pillOptions"
        bg-class="bg-elev3"
        full
      />
      <UiInput
        v-model="amount"
        :label="t('finance.amount')"
        type="number"
        placeholder="₽"
      />
      <div class="grid grid-cols-4 gap-2">
        <UiCategoryTile
          v-for="cat in filteredCategories"
          :key="cat.id"
          :category="cat"
          :selected="selectedCategory === cat.id"
          @click="selectedCategory = cat.id"
        />
      </div>
      <UiInput v-model="note" :label="t('finance.note')" type="text" />
      <UiButton class="w-full" type="submit">
        {{ t('general.save') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
