<script lang="ts" setup>
interface Props {
  balance: number
  monthlyDelta: number
}

const props = defineProps<Props>()
defineEmits<{ add: [], withdraw: [] }>()

const { t } = useI18n()
</script>

<template>
  <div
    class="relative overflow-hidden flex flex-col gap-4 p-5 rounded-2xl border"
    style="background: linear-gradient(to bottom, rgba(94,234,212,0.10), var(--c-elev1)); border-color: rgba(94,234,212,0.20);"
  >
    <div
      class="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
      style="background: #5EEAD4; opacity: 0.06; filter: blur(30px);"
    />

    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-widest text-text-mute">
          {{ t('finance.savings.balance') }}
        </span>
        <span class="text-[44px] font-bold leading-none text-text font-display">
          {{ formatAmount(props.balance) }} ₽
        </span>
      </div>

      <span
        v-if="props.monthlyDelta !== 0"
        class="mt-1 shrink-0 px-2.5 py-1 rounded-full text-sm font-semibold"
        :class="props.monthlyDelta > 0 ? 'bg-success/14 text-success' : 'bg-danger/14 text-danger'"
      >
        {{ props.monthlyDelta > 0 ? '+' : '' }}{{ formatAmount(props.monthlyDelta) }} ₽
      </span>
    </div>

    <p class="text-xs text-text-mute -mt-2">
      {{ t('finance.savings.thisMonth') }}
    </p>

    <div class="flex gap-2">
      <button
        class="flex flex-1 items-center justify-center gap-1.5 h-11 rounded-[10px] bg-elev2 text-success text-sm font-semibold transition-transform duration-fast active:scale-95"
        @click="$emit('add')"
      >
        <UIcon name="i-lucide-arrow-up" class="w-4 h-4" />
        {{ t('finance.savings.add') }}
      </button>
      <button
        class="flex flex-1 items-center justify-center gap-1.5 h-11 rounded-[10px] bg-elev2 text-warning text-sm font-semibold transition-transform duration-fast active:scale-95"
        @click="$emit('withdraw')"
      >
        <UIcon name="i-lucide-arrow-down" class="w-4 h-4" />
        {{ t('finance.savings.withdraw') }}
      </button>
    </div>
  </div>
</template>
