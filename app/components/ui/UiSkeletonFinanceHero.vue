<script lang="ts" setup>
const { t } = useI18n()

</script>

<template>
  <div class="flex flex-col p-4 mb-2 border border-hairline rounded-2xl bg-gradient-to-b from-accent-soft to-elev1 gap-4">
    <span class="text-xs font-semibold uppercase tracking-widest text-text-mute">{{ t('finance.balance') }}</span>
    <UiSkeleton :h="52" :r="8" />

    <UiSkeleton />

    <div class="flex justify-between">
      <UiSkeleton :w="100" :h="16" />
      <UiSkeleton :w="100" :h="16" />
    </div>
  </div>
</template>
