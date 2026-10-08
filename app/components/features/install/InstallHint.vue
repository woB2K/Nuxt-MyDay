<script lang="ts" setup>
const { t } = useI18n()
const { eligible } = usePwaInstall()

const sheetOpen = ref(false)
</script>

<template>
  <button
    v-if="eligible"
    class="relative flex min-h-14 w-max max-w-full items-center gap-3 rounded-2xl border border-hairline2 bg-elev1 py-2.5 pr-3 pl-2.5 text-left transition-transform duration-fast active:scale-[0.97]"
    type="button"
    @click="sheetOpen = true"
  >
    <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
      <UIcon name="i-lucide-download" class="size-4.5" />
    </span>
    <span class="flex min-w-0 flex-col">
      <span class="text-[15px] font-semibold leading-5 text-text">{{ t('install.welcome.title') }}</span>
      <span class="text-[13px] font-medium leading-[18px] text-text-dim">{{ t('install.welcome.sub') }}</span>
    </span>
    <UIcon name="i-lucide-chevron-right" class="size-4.5 shrink-0 text-text-mute" />
  </button>

  <InstallSheet v-model:open="sheetOpen" context="welcome" />
</template>
