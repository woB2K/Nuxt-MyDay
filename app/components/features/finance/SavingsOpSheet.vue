<script lang="ts" setup>
import { MAX_NOTES_LENGTH } from '~~/shared/schemas'

type SavingsMode = 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING'

const props = defineProps<{
  open: boolean
  mode: SavingsMode
  balance: number
  entry?: SavingsEntryItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addSavings, isPending: isAdding } = useAddSavingsMutation()
const { mutate: updateSavings, isPending: isUpdating } = useUpdateSavingsMutation()
const { data: goals } = useGoalsQuery()

const QUICK_AMOUNTS = [500, 1000, 2500, 5000]

const modes = {
  DEPOSIT: { title: 'finance.savings.addTitle', submit: 'finance.savings.add', color: 'text-success', sign: '+' },
  WITHDRAWAL: { title: 'finance.savings.withdrawTitle', submit: 'finance.savings.withdraw', color: 'text-warning', sign: '−' },
  OPENING: { title: 'finance.savings.opening', submit: 'general.save', color: 'text-text', sign: '' }
} as const

const amount = ref('')
const note = ref('')
const goalId = ref<string | null>(null)

const type = computed(() => props.entry?.type ?? props.mode)
const current = computed(() => modes[type.value])
const isOpening = computed(() => type.value === 'OPENING')
const isEditing = computed(() => !!props.entry)
const isPending = computed(() => isAdding.value || isUpdating.value)
const title = computed(() => isEditing.value && !isOpening.value ? 'finance.savings.editTitle' : current.value.title)
const submitLabel = computed(() => isEditing.value ? 'general.save' : current.value.submit)
const available = computed(() => props.entry?.type === 'WITHDRAWAL' ? props.balance + props.entry.amount : props.balance)

watch(() => props.open, (open) => {
  if (!open) return

  amount.value = props.entry ? String(props.entry.amount) : ''
  note.value = props.entry?.notes ?? ''
  goalId.value = props.entry?.goalId ?? null
}, { immediate: true })

function submit() {
  const value = Number(amount.value)

  if (!value || value <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (type.value === 'WITHDRAWAL' && value > available.value) {
    toast.error(t('finance.savings.notEnough'))
    return
  }

  const close = { onSuccess: () => emit('update:open', false) }

  if (props.entry) {
    updateSavings({ id: props.entry.id, amount: value, notes: note.value, ...(!isOpening.value && { goalId: goalId.value }) }, close)
    return
  }

  addSavings({
    type: props.mode,
    amount: value,
    notes: note.value || undefined,
    ...(!isOpening.value && { goalId: goalId.value })
  }, close)
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="t(title)"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div class="flex flex-col items-center gap-1">
        <div class="flex max-w-full items-baseline justify-center gap-1.5">
          <UiAmountInput
            v-model="amount"
            class="text-[48px] font-bold tracking-[-0.03em]"
            :class="current.color"
          />
          <span class="text-[34px] font-bold text-text-mute">₽</span>
        </div>
        <span v-if="isOpening" class="text-xs text-text-mute text-center text-balance">
          {{ t('finance.savings.openingHint') }}
        </span>
        <span v-else class="text-xs text-text-mute">
          {{ t('finance.savings.available') }} · {{ formatAmount(available) }} ₽
        </span>
      </div>

      <div v-if="!isOpening" class="flex gap-2 justify-center">
        <UiChip
          v-for="quick in QUICK_AMOUNTS"
          :key="quick"
          :label="`${current.sign}${formatAmount(quick)}`"
          :active="Number(amount) === quick"
          @click="amount = String(quick)"
        />
      </div>

      <div v-if="!isOpening && goals?.length" class="flex flex-col gap-2.5" data-testid="savings-goal-picker">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('finance.goals.picker') }}
        </span>
        <div class="flex flex-wrap gap-2">
          <UiChip :label="t('finance.goals.none')" :active="goalId === null" @click="goalId = null" />
          <UiChip
            v-for="goal in goals"
            :key="goal.id"
            :label="goal.name"
            icon="i-lucide-target"
            :active="goalId === goal.id"
            @click="goalId = goal.id"
          />
        </div>
      </div>

      <UiInput v-model="note" :label="t('finance.note')" type="text" :maxlength="MAX_NOTES_LENGTH" />

      <UiButton class="w-full" type="submit" :loading="isPending">
        {{ t(submitLabel) }}
      </UiButton>
    </form>
  </UiSheet>
</template>
