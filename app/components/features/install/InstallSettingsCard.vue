<script lang="ts" setup>
const { t } = useI18n()
const { eligible } = usePwaInstall()

const sheetOpen = ref(false)
</script>

<template>
  <UiCard v-if="eligible" :padding="0">
    <UiSettingRow
      icon="i-lucide-download"
      :label="t('install.settings.label')"
      :sub="t('install.settings.sub')"
      clickable
      last
      @click="sheetOpen = true"
    />
  </UiCard>

  <InstallSheet v-model:open="sheetOpen" context="settings" />
</template>
