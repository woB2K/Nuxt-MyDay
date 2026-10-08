<script lang="ts" setup>
type SavingsMode = 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING'

const props = defineProps<{
  open: boolean
  mode: SavingsMode
  balance: number
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addSavings, isPending } = useAddSavingsMutation()

const QUICK_AMOUNTS = [500, 1000, 2500, 5000]

const modes = {
  DEPOSIT: { title: 'finance.savings.addTitle', submit: 'finance.savings.add', color: 'text-success', sign: '+' },
  WITHDRAWAL: { title: 'finance.savings.withdrawTitle', submit: 'finance.savings.withdraw', color: 'text-warning', sign: '−' },
  OPENING: { title: 'finance.savings.opening', submit: 'general.save', color: 'text-text', sign: '' }
} as const

const amount = ref('')
const note = ref('')

const current = computed(() => modes[props.mode])
const isOpening = computed(() => props.mode === 'OPENING')

watch(() => props.open, (open) => {
  if (!open) return

  amount.value = ''
  note.value = ''
}, { immediate: true })

function submit() {
  const value = Number(amount.value)

  if (!value || value <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (props.mode === 'WITHDRAWAL' && value > props.balance) {
    toast.error(t('finance.savings.notEnough'))
    return
  }

  addSavings({
    type: props.mode,
    amount: value,
    notes: note.value || undefined
  }, {
    onSuccess: () => emit('update:open', false)
  })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="t(current.title)"
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
          {{ t('finance.savings.available') }} · {{ formatAmount(props.balance) }} ₽
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

      <UiInput v-model="note" :label="t('finance.note')" type="text" />

      <UiButton class="w-full" type="submit" :loading="isPending">
        {{ t(current.submit) }}
      </UiButton>
    </form>
  </UiSheet>
</template>
