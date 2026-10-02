<script lang="ts" setup>
const props = defineProps<{
  open: boolean
  mode: 'DEPOSIT' | 'WITHDRAWAL'
  balance: number
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addSavings, isPending } = useAddSavingsMutation()

const QUICK_AMOUNTS = [500, 1000, 2500, 5000]

const amount = ref('')
const note = ref('')

const isDeposit = computed(() => props.mode === 'DEPOSIT')

watch(() => props.open, (open) => {
  if (!open) return

  amount.value = ''
  note.value = ''
}, { immediate: true })

function onAmountInput(event: Event) {
  amount.value = (event.target as HTMLInputElement).value.replace(/[^\d.]/g, '')
}

function submit() {
  const value = Number(amount.value)

  if (!value || value <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (!isDeposit.value && value > props.balance) {
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
    :title="isDeposit ? t('finance.savings.addTitle') : t('finance.savings.withdrawTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div class="flex flex-col items-center gap-1">
        <div class="flex items-baseline justify-center gap-1.5">
          <input
            :value="amount"
            class="w-44 text-center bg-transparent outline-none text-[48px] font-bold tracking-[-0.03em]"
            :class="isDeposit ? 'text-success' : 'text-warning'"
            inputmode="decimal"
            placeholder="0"
            type="text"
            @input="onAmountInput"
          >
          <span class="text-[34px] font-bold text-text-mute">₽</span>
        </div>
        <span class="text-xs text-text-mute">
          {{ t('finance.savings.available') }} · {{ formatAmount(props.balance) }} ₽
        </span>
      </div>

      <div class="flex gap-2 justify-center">
        <UiChip
          v-for="quick in QUICK_AMOUNTS"
          :key="quick"
          :label="`${isDeposit ? '+' : '−'}${formatAmount(quick)}`"
          :active="Number(amount) === quick"
          @click="amount = String(quick)"
        />
      </div>

      <UiInput v-model="note" :label="t('finance.note')" type="text" />

      <UiButton class="w-full" type="submit" :loading="isPending">
        {{ isDeposit ? t('finance.savings.add') : t('finance.savings.withdraw') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
