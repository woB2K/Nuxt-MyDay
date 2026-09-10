<script lang="ts" setup>
import type { Period, PeriodPresetKey } from '~/utils/period'
import { toDateString } from '~/utils/formatDate'
import { monthStart, periodPresetKeys, periodPresets, periodRange, rangePeriod } from '~/utils/period'

const props = defineProps<{
  open: boolean
  period: Period
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'apply': [value: Period]
}>()

const { t } = useI18n()
const toast = useAppToast()

const customOpen = ref(false)
const from = ref(monthStart())
const to = ref(toDateString())

watch(() => props.open, (open) => {
  if (!open) return

  const range = periodRange(props.period)
  customOpen.value = props.period.preset === 'custom'
  from.value = range?.from ?? monthStart()
  to.value = range?.to ?? toDateString()
})

function applyPreset(key: PeriodPresetKey) {
  customOpen.value = false
  emit('apply', periodPresets[key]())
  emit('update:open', false)
}

function applyRange() {
  if (!from.value || !to.value) return

  if (from.value > to.value) {
    toast.error(t('finance.period.invalidRange'))
    return
  }

  emit('apply', rangePeriod(from.value, to.value))
  emit('update:open', false)
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('finance.period.title')" @update:open="emit('update:open', $event)">
    <div class="overflow-hidden rounded-xl border border-hairline bg-elev2">
      <button
        v-for="key in periodPresetKeys"
        :key="key"
        class="w-full flex items-center gap-3 px-4 py-3.5 border-t border-hairline first:border-t-0"
        type="button"
        @click="applyPreset(key)"
      >
        <span
          class="flex-1 text-left text-[15px]"
          :class="props.period.preset === key ? 'text-accent font-semibold' : 'text-text font-medium'"
        >{{ t(`finance.period.presets.${key}`) }}</span>
        <UIcon v-if="props.period.preset === key" name="i-lucide-check" class="w-4.5 h-4.5 text-accent" />
      </button>
    </div>

    <button
      class="mt-3 w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl border"
      :class="customOpen ? 'bg-accent-soft border-accent' : 'bg-elev2 border-hairline'"
      type="button"
      @click="customOpen = !customOpen"
    >
      <UIcon
        name="i-lucide-calendar"
        class="w-4.5 h-4.5"
        :class="customOpen ? 'text-accent' : 'text-text-mute'"
      />
      <span
        class="flex-1 text-left text-[15px] font-semibold"
        :class="customOpen ? 'text-accent' : 'text-text'"
      >{{ t('finance.period.customRange') }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="w-3.5 h-3.5 transition-transform duration-base ease-out"
        :class="[customOpen ? 'text-accent rotate-180' : 'text-text-mute']"
      />
    </button>

    <div v-if="customOpen" class="mt-3 flex flex-col gap-3">
      <div class="flex gap-2.5">
        <label class="flex-1 flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-text-dim">{{ t('finance.period.from') }}</span>
          <input
            v-model="from"
            class="h-12 w-full px-3 rounded-xl border border-hairline bg-elev2 text-text text-[15px] outline-none [color-scheme:dark]"
            type="date"
          >
        </label>
        <label class="flex-1 flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-text-dim">{{ t('finance.period.to') }}</span>
          <input
            v-model="to"
            class="h-12 w-full px-3 rounded-xl border border-hairline bg-elev2 text-text text-[15px] outline-none [color-scheme:dark]"
            type="date"
          >
        </label>
      </div>
      <UiButton class="w-full" @click="applyRange">
        {{ t('finance.period.apply') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
