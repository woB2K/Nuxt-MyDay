<script lang="ts" setup>
interface Props {
  amount: number
  sign?: string
}

const props = withDefaults(defineProps<Props>(), { sign: '' })

const { t } = useI18n()
const { hidden } = useMoney()
</script>

<template>
  <span v-if="hidden" class="inline-flex items-center gap-[0.22em] whitespace-nowrap">
    <span
      class="inline-block h-[0.62em] w-[2.6em] rounded-[0.2em] bg-current opacity-25"
      aria-hidden="true"
      data-testid="money-hidden"
    />
    <span class="sr-only">{{ t('finance.privacy.hiddenAmount') }}</span>
    <span>₽</span>
  </span>
  <span v-else class="whitespace-nowrap">{{ props.sign }}{{ formatAmount(props.amount) }} ₽</span>
</template>
