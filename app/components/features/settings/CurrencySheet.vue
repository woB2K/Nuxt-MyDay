<script lang="ts" setup>
import type { Currency } from '~~/shared/currency'
import { CURRENCIES } from '~~/shared/currency'
import { currencyAffix } from '~/utils/formatAmount'

const props = defineProps<{ open: boolean }>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t, locale } = useI18n()
const toast = useAppToast()
const { currency, name } = useCurrency()
const { isFamily } = useFamily()
const { mutate: update, isPending } = useUpdateHouseholdMutation()

const options = computed(() => CURRENCIES.map((code) => {
  const { prefix, suffix } = currencyAffix(code, locale.value)

  return { code, name: name(code), symbol: prefix || suffix }
}))

function pick(code: Currency) {
  if (isPending.value) return

  if (code === currency.value) {
    emit('update:open', false)
    return
  }

  update({ currency: code }, {
    onSuccess: () => {
      toast.success(t('settings.currencyScreen.done', { name: name(code) }))
      emit('update:open', false)
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('settings.currencyScreen.title')" @update:open="emit('update:open', $event)">
    <p class="mb-3 text-[13px] text-text-mute text-balance">
      {{ t(isFamily ? 'settings.currencyScreen.hintFamily' : 'settings.currencyScreen.hint') }}
    </p>

    <div class="mb-4 overflow-hidden rounded-xl border border-hairline bg-elev2">
      <button
        v-for="option in options"
        :key="option.code"
        class="w-full flex items-center gap-3 px-4 py-3 border-t border-hairline first:border-t-0"
        type="button"
        :disabled="isPending"
        data-testid="currency-option"
        :data-currency="option.code"
        @click="pick(option.code)"
      >
        <span class="size-7 shrink-0 flex items-center justify-center rounded-full bg-elev3 text-[13px] font-semibold text-text-dim">
          {{ option.symbol }}
        </span>
        <span class="flex min-w-0 flex-1 flex-col text-left">
          <span
            class="truncate text-[15px]"
            :class="option.code === currency ? 'text-accent font-semibold' : 'text-text font-medium'"
          >{{ option.name }}</span>
          <span class="text-xs text-text-mute">{{ option.code }}</span>
        </span>
        <UIcon v-if="option.code === currency" name="i-lucide-check" class="size-4.5 shrink-0 text-accent" />
      </button>
    </div>
  </UiSheet>
</template>
