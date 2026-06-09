<script lang="ts" setup>
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const toast = useAppToast()

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
const { mutate, isPending } = useAddTransactionMutation()

const filteredCategories = computed(() => {
  return categories.value?.filter(c => c.type === currentTypeCategory.value)
})
const selectedCategory = ref()

function addTransaction() {
  if (!amount.value || Number(amount.value) <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (!selectedCategory.value) {
    toast.error(t('finance.error.category'))
    return
  }

  mutate({
    type: currentTypeCategory.value,
    amount: Number(amount.value),
    categoryId: selectedCategory.value,
    date: new Date().toISOString(),
    notes: note.value ?? ''
  }, {
    onSuccess: () => {
      emit('update:open', false)
      note.value = ''
      amount.value = null
      selectedCategory.value = null
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('finance.addTransaction')" @update:open="emit('update:open', $event)">
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
      <UiButton class="w-full" type="submit" :disabled="isPending">
        {{ t('general.save') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
