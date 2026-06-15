<script lang="ts" setup>
const props = defineProps<{ open: boolean, initialType: 'DEPOSIT' | 'WITHDRAWAL' }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const toast = useAppToast()

const { t } = useI18n()

const amount = ref<string>('')
const note = ref<string>()

const { mutate, isPending } = useAddSavingsMutation()

function addSavings() {
  if (!amount.value || Number(amount.value) <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  mutate({
    type: props.initialType,
    amount: Number(amount.value),
    notes: note.value || undefined
  }, {
    onSuccess: () => {
      emit('update:open', false)
      note.value = ''
      amount.value = ''
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" :title="props.initialType === 'DEPOSIT' ? t('finance.savings.deposit') : t('finance.savings.withdrawal')" @update:open="emit('update:open', $event)">
    <form class="flex flex-col items-center gap-5" @submit.prevent="addSavings">
      <UiInput
        v-model="amount"
        :label="t('finance.amount')"
        type="number"
        placeholder="₽"
      />
      <UiInput v-model="note" :label="t('finance.note')" type="text" />
      <UiButton class="w-full" type="submit" :disabled="isPending">
        {{ t('general.save') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
