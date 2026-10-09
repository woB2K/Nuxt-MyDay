<script lang="ts" setup>
import { formatLongDay } from '~/utils/formatDate'

const props = withDefaults(defineProps<{ expiresAt: Date | string, last?: boolean }>(), { last: true })
const emit = defineEmits<{ open: [] }>()

const { t, locale } = useI18n()
</script>

<template>
  <button
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-fast active:bg-elev3"
    :class="{ 'border-b border-hairline': !props.last }"
    type="button"
    data-testid="pending-invite"
    @click="emit('open')"
  >
    <UiIconDisc icon="i-lucide-clock" tone="warning" :size="40" />
    <span class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-[15px] font-semibold text-text">{{ t('family.invite.pendingRow') }}</span>
      <span class="truncate text-[13px] text-text-dim">
        {{ t('family.invite.pendingSub', { date: formatLongDay(props.expiresAt, locale) }) }}
      </span>
    </span>
    <UIcon name="i-lucide-chevron-right" class="size-4.5 shrink-0 text-text-mute" />
  </button>
</template>
