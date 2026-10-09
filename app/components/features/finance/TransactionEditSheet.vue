<script lang="ts" setup>
import type { TransactionItem } from '~~/shared/types'
import { formatLongDay, toDateString, toDayKey } from '~/utils/formatDate'

const props = defineProps<{
  open: boolean
  transaction?: TransactionItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t, locale } = useI18n()
const toast = useAppToast()
const { members, isFamily } = useFamily()

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

const authorLine = computed(() => {
  const tx = props.transaction
  if (!tx || !isFamily.value) return ''

  const author = members.value.find(member => member.userId === tx.userId)

  return t('family.author', {
    name: author?.name ?? t('family.formerMember'),
    date: formatLongDay(tx.createdAt, locale.value)
  })
})
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

const amountError = ref('')
const categoryError = ref('')

watch(amount, () => {
  amountError.value = ''
})

watch(categoryId, () => {
  categoryError.value = ''
})

function close() {
  emit('update:open', false)
}

function submit() {
  const value = Number(amount.value)

  amountError.value = ''
  categoryError.value = ''

  if (!value || value <= 0) {
    amountError.value = t('finance.error.amount')
    toast.error(t('finance.error.amount'))
    return
  }

  if (!categoryId.value) {
    categoryError.value = t('finance.error.category')
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

      <div class="flex flex-col items-center gap-1.5">
        <div class="flex max-w-full items-baseline justify-center gap-1.5">
          <UiAmountInput
            v-model="amount"
            class="text-[48px] font-bold tracking-[-0.03em]"
            :class="type === 'INCOME' ? 'text-success' : 'text-text'"
          />
          <span class="text-[34px] font-bold text-text-mute">₽</span>
        </div>
        <span v-if="amountError" class="text-sm text-danger">{{ amountError }}</span>
        <span v-if="authorLine" class="text-[13px] text-text-mute" data-testid="tx-author-line">{{ authorLine }}</span>
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
        <span v-if="categoryError" class="text-sm text-danger">{{ categoryError }}</span>
      </div>

      <UiInput v-model="note" :label="t('finance.note')" type="text" />

      <label class="flex flex-col gap-2">
        <span class="text-[13px] text-text-dim">{{ t('finance.date') }}</span>
        <UiDateInput
          v-model="date"
          class="h-12 w-full px-3.5 rounded-xl border border-hairline2 bg-field text-text text-base outline-none"
        />
      </label>

      <UiButton class="w-full" type="submit" :loading="isPending">
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
