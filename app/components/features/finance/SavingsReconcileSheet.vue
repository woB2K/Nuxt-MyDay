<script lang="ts" setup>
import { MAX_NOTES_LENGTH } from '~~/shared/schemas'

const props = defineProps<{
  open: boolean
  own: number
  shared: boolean
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: reconcile, isPending } = useReconcileSavingsMutation()

const amount = ref('')
const note = ref('')

const difference = computed(() => amount.value === '' ? null : Math.round((Number(amount.value) - props.own) * 100) / 100)
const differenceInk = computed(() => !difference.value ? 'text-text-mute' : difference.value > 0 ? 'text-success' : 'text-warning')
const differenceSign = computed(() => !difference.value ? '' : difference.value > 0 ? '+' : '−')

watch(() => props.open, (open) => {
  if (!open) return

  amount.value = ''
  note.value = ''
}, { immediate: true })

function submit() {
  if (difference.value === null) {
    toast.error(t('finance.error.amount'))
    return
  }

  if (difference.value === 0) {
    toast.error(t('finance.savings.reconcileMatches'))
    return
  }

  reconcile(
    { actual: Number(amount.value), notes: note.value || undefined },
    { onSuccess: () => emit('update:open', false) }
  )
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="t('finance.savings.reconcileTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" data-testid="savings-reconcile-sheet" @submit.prevent="submit">
      <div class="flex flex-col items-center gap-1">
        <span class="text-xs text-text-mute">{{ t('finance.savings.reconcileActual') }}</span>
        <div class="flex max-w-full items-baseline justify-center gap-1.5">
          <UiAmountInput v-model="amount" class="text-[48px] font-bold tracking-[-0.03em] text-text" />
          <span class="text-[34px] font-bold text-text-mute">₽</span>
        </div>
        <span class="text-xs text-text-mute">
          {{ t(props.shared ? 'finance.savings.reconcileOwnShare' : 'finance.savings.reconcileInApp') }} · {{ formatMoney(props.own) }}
        </span>
        <span v-if="difference !== null" class="text-sm font-semibold" :class="differenceInk" data-testid="reconcile-difference">
          {{ t('finance.savings.reconcileDifference') }} · {{ formatMoney(Math.abs(difference), differenceSign) }}
        </span>
      </div>

      <span class="text-xs text-text-mute text-center text-balance">
        {{ t('finance.savings.reconcileHint') }}
      </span>

      <UiInput v-model="note" :label="t('finance.note')" type="text" :maxlength="MAX_NOTES_LENGTH" />

      <UiButton class="w-full" type="submit" :loading="isPending">
        {{ t('finance.savings.reconcileSubmit') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
