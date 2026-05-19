<script lang="ts" setup>
import { TAB_ITEMS } from '~/utils/routes'
const { t } = useI18n()

const route = useRoute()
const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <div class="flex fixed bottom-0 pb-safe w-full items-center bg-[rgba(15,15,20,0.85)] backdrop-blur-[24px] p-2 text-text-dim border-t border-white/10">
    <NuxtLink
      v-for="tab in TAB_ITEMS"
      :key="tab.path"
      :to="tab.path"
      class="flex flex-col items-center flex-1 gap-2"
      :class="{ 'text-accent': isActive(tab.path) }"
    >
      <UIcon
        :name="tab.icon" class="size-6"
      />
      <span class="text-xs">{{ t(tab.labelKey) }}</span>
    </NuxtLink>
  </div>
</template>
