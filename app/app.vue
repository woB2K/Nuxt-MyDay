<script setup lang="ts">
import { useAuthStore } from './stores/auth'

const { t, locale } = useI18n()
const { accent, surfaceColor } = useTheme()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: () => surfaceColor.value }
  ],
  htmlAttrs: {
    'lang': () => locale.value,
    'data-accent': () => accent.value
  }
})

useSeoMeta({
  title: () => t('app.title'),
  description: () => t('app.description'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('app.description'),
  twitterCard: 'summary_large_image'
})

const authStore = useAuthStore()
await authStore.init()
</script>

<template>
  <NuxtLayout>
    <VitePwaManifest />
    <NuxtPage />
    <UiToast />
  </NuxtLayout>
</template>
