<script lang="ts" setup>
import type { TransactionItem } from '~~/shared/types'
import { toDateString, toDayKey } from '~/utils/formatDate'

const props = defineProps<{
  open: boolean
  transaction?: TransactionItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { data: categories } = useCategoriesQuery()
const { mutate: addTransaction, isPending: isAdding } = useAddTransactionMutation()
const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransactionMutation()
const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransactionMutation()

const type = ref<'INCOME' | 'EXPENSE'>('EXPENSE')
const amount = ref('')
const categoryId = ref<string>()
const note = ref('')
const date = ref(toDateString())

const isEdit = computed(() => !!props.transaction)
const isPending = computed(() => isAdding.value || isUpdating.value || isDeleting.value)

const typeOptions = computed(() => [
  { value: 'EXPENSE', label: `↓ ${t('finance.expense')}`, color: 'var(--c-danger)', inkColor: '#F4F4F7' },
  { value: 'INCOME', label: `↑ ${t('finance.income')}`, color: 'var(--c-success)', inkColor: '#0F0F14' }
])

const filteredCategories = computed(() => categories.value?.filter(c => c.type === type.value) ?? [])

function reset() {
  const tx = props.transaction

  type.value = tx?.type ?? 'EXPENSE'
  amount.value = tx ? String(tx.amount) : ''
  categoryId.value = tx?.categoryId
  note.value = tx?.notes ?? ''
  date.value = tx ? toDayKey(tx.date) : toDateString()
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

watch(type, (next, previous) => {
  if (next === previous) return

  categoryId.value = filteredCategories.value[0]?.id
})

function onAmountInput(event: Event) {
  amount.value = (event.target as HTMLInputElement).value.replace(/[^\d.]/g, '')
}

function close() {
  emit('update:open', false)
}

function submit() {
  const value = Number(amount.value)

  if (!value || value <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (!categoryId.value) {
    toast.error(t('finance.error.category'))
    return
  }

  const payload = {
    type: type.value,
    amount: value,
    categoryId: categoryId.value,
    notes: note.value,
    date: date.value
  }

  if (props.transaction) {
    updateTransaction({ id: props.transaction.id, ...payload }, { onSuccess: close })
    return
  }

  addTransaction(payload, { onSuccess: close })
}

function remove() {
  if (!props.transaction) return

  deleteTransaction(props.transaction.id, { onSuccess: close })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('finance.editTransaction') : t('finance.addTransaction')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <UiPillSelect
        v-model="type"
        :options="typeOptions"
        bg-class="bg-elev3"
        full
      />

      <div class="flex items-baseline justify-center gap-1.5">
        <input
          :value="amount"
          class="w-44 text-center bg-transparent outline-none text-[48px] font-bold tracking-[-0.03em]"
          :class="type === 'INCOME' ? 'text-success' : 'text-text'"
          inputmode="decimal"
          placeholder="0"
          type="text"
          @input="onAmountInput"
        >
        <span class="text-[34px] font-bold text-text-mute">₽</span>
      </div>

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('finance.category') }}
        </span>
        <div class="grid grid-cols-4 gap-2">
          <UiCategoryTile
            v-for="category in filteredCategories"
            :key="category.id"
            :category="category"
            :selected="categoryId === category.id"
            @click="categoryId = category.id"
          />
        </div>
      </div>

      <UiInput v-model="note" :label="t('finance.note')" type="text" />

      <label class="flex flex-col gap-2">
        <span class="text-[13px] text-text-dim">{{ t('finance.date') }}</span>
        <input
          v-model="date"
          class="h-12 w-full px-3.5 rounded-xl border border-hairline bg-elev2 text-text text-base outline-none [color-scheme:dark]"
          type="date"
        >
      </label>

      <UiButton class="w-full" type="submit" :disabled="isPending">
        {{ t('general.save') }}
      </UiButton>

      <button
        v-if="isEdit"
        class="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger text-[15px] font-semibold disabled:opacity-50"
        :disabled="isPending"
        type="button"
        @click="remove"
      >
        <UIcon name="i-lucide-trash-2" class="w-4.5 h-4.5" />
        {{ t('finance.deleteTransaction') }}
      </button>
    </form>
  </UiSheet>
</template>
