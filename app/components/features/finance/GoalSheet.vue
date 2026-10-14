<script lang="ts" setup>
import type { SavingsGoalItem } from '~~/shared/types'
import { formatLongDay, toDayKey } from '~/utils/formatDate'
import { goalProgress } from '~/utils/goals'

const props = defineProps<{
  open: boolean
  goal?: SavingsGoalItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t, locale } = useI18n()
const toast = useAppToast()

const { mutate: addGoal, isPending: isAdding } = useAddGoalMutation()
const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoalMutation()
const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoalMutation()

const name = ref('')
const target = ref('')
const deadline = ref('')

const isEdit = computed(() => !!props.goal)
const isPending = computed(() => isAdding.value || isUpdating.value || isDeleting.value)

const preview = computed(() => {
  const value = Number(target.value)
  if (!value || !deadline.value) return ''

  const { monthly } = goalProgress({ target: value, saved: props.goal?.saved ?? 0, deadline: deadline.value })

  return monthly ? t('finance.goals.monthly', { amount: formatAmount(monthly) }) : ''
})

watch(() => props.open, (open) => {
  if (!open) return

  name.value = props.goal?.name ?? ''
  target.value = props.goal ? String(props.goal.target) : ''
  deadline.value = props.goal?.deadline ? toDayKey(props.goal.deadline) : ''
}, { immediate: true })

function close() {
  emit('update:open', false)
}

function submit() {
  const value = Number(target.value)

  if (!name.value.trim()) {
    toast.error(t('finance.goals.nameError'))
    return
  }

  if (!value || value <= 0) {
    toast.error(t('finance.error.amount'))
    return
  }

  const payload = { name: name.value.trim(), target: value, deadline: deadline.value || null }

  if (props.goal) {
    updateGoal({ id: props.goal.id, ...payload }, { onSuccess: close })
    return
  }

  addGoal(payload, { onSuccess: close })
}

function remove() {
  if (!props.goal) return

  deleteGoal(props.goal.id, { onSuccess: close })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('finance.goals.edit') : t('finance.goals.add')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <UiInput v-model="name" :label="t('finance.goals.name')" type="text" />

      <div class="flex flex-col items-center gap-1">
        <span class="text-[13px] text-text-dim">{{ t('finance.goals.target') }}</span>
        <div class="flex max-w-full items-baseline justify-center gap-1.5">
          <UiAmountInput v-model="target" class="text-[44px] font-bold tracking-[-0.03em] text-text" />
          <span class="text-[30px] font-bold text-text-mute">₽</span>
        </div>
      </div>

      <label class="flex flex-col gap-2">
        <span class="flex items-center justify-between text-[13px] text-text-dim">
          {{ t('finance.goals.deadline') }}
          <button
            v-if="deadline"
            class="text-[13px] font-semibold text-accent"
            type="button"
            @click.prevent="deadline = ''"
          >
            {{ t('finance.goals.removeDeadline') }}
          </button>
        </span>
        <UiDateInput
          v-model="deadline"
          class="h-12 w-full px-3.5 rounded-xl border border-hairline2 bg-field text-text text-base outline-none"
          data-testid="goal-deadline"
        />
        <span class="text-xs text-text-mute">
          {{ deadline ? (preview || t('finance.goals.until', { date: formatLongDay(deadline, locale) })) : t('finance.goals.noDeadline') }}
        </span>
      </label>

      <UiButton class="w-full" type="submit" :loading="isPending" data-testid="goal-save">
        {{ t('general.save') }}
      </UiButton>

      <button
        v-if="isEdit"
        class="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger-soft text-danger text-[15px] font-semibold disabled:opacity-50"
        :disabled="isPending"
        type="button"
        @click="remove"
      >
        <UIcon name="i-lucide-trash-2" class="w-4.5 h-4.5" />
        {{ t('finance.goals.delete') }}
      </button>
    </form>
  </UiSheet>
</template>
