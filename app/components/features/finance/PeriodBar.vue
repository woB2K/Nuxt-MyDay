<script lang="ts" setup>
import type { Period } from '~/utils/period'
import { fromDateString } from '~/utils/formatDate'
import { monthEnd, monthPeriod, shiftMonth } from '~/utils/period'

const props = defineProps<{ period: Period }>()
const emit = defineEmits<{
  'update:period': [value: Period]
  'openSheet': []
}>()

const { t, locale } = useI18n()

const isMonth = computed(() => props.period.mode === 'month')

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDayMonth(date: string): string {
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' })
    .format(fromDateString(date))
}

const label = computed<{ main: string, sub: string }>(() => {
  const period = props.period

  if (period.mode === 'all') {
    return { main: t('finance.period.presets.all'), sub: t('finance.period.everything') }
  }

  if (period.mode === 'month') {
    const start = fromDateString(period.month)
    const monthName = new Intl.DateTimeFormat(locale.value, { month: 'long' }).format(start)
    const shortMonth = new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(start)

    return {
      main: `${capitalize(monthName)} ${start.getFullYear()}`,
      sub: `1–${fromDateString(monthEnd(period.month)).getDate()} ${shortMonth}`
    }
  }

  return {
    main: `${formatDayMonth(period.from)} – ${formatDayMonth(period.to)}`,
    sub: period.preset === 'custom' ? t('finance.period.customRange') : t('finance.period.preset')
  }
})

function step(months: number) {
  if (props.period.mode !== 'month') return

  emit('update:period', monthPeriod(shiftMonth(props.period.month, months)))
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UiRoundBtn :disabled="!isMonth" @click="step(-1)">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <button
      class="flex-1 min-w-0 h-11 flex items-center justify-center gap-2 rounded-xl border border-hairline bg-elev1 transition-transform duration-fast ease-spring active:scale-[0.98]"
      type="button"
      @click="emit('openSheet')"
    >
      <UIcon name="i-lucide-calendar" class="w-4 h-4 text-accent shrink-0" />
      <span class="flex flex-col items-start min-w-0 leading-tight">
        <span class="font-display text-[15px] font-semibold text-text truncate max-w-[190px]">{{ label.main }}</span>
        <span class="mt-0.5 text-[11px] font-medium text-text-mute">{{ label.sub }}</span>
      </span>
      <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 text-text-mute shrink-0" />
    </button>

    <UiRoundBtn :disabled="!isMonth" @click="step(1)">
      <UIcon name="i-lucide-chevron-right" class="w-4.5 h-4.5" />
    </UiRoundBtn>
  </div>
</template>
