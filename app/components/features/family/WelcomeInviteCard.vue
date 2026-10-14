<script lang="ts" setup>
const props = defineProps<{ name: string, colorIndex: number }>()

const { t } = useI18n()
</script>

<template>
  <div
    class="flex w-full items-center gap-3 rounded-2xl border border-accent-soft bg-elev1 py-3 pr-3.5 pl-3 text-left ring-4 ring-accent-soft animate-step-in"
    data-testid="welcome-invite"
  >
    <UiAvatar :name="props.name" :color-index="props.colorIndex" :size="40" />
    <span class="flex min-w-0 flex-col">
      <span class="text-[15px] font-semibold text-text">{{ t('family.welcome.card', { name: props.name }) }}</span>
      <span class="text-[13px] font-medium text-text-dim">{{ t('family.welcome.cardSub') }}</span>
    </span>
  </div>
</template>
