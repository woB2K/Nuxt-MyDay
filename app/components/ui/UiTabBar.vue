<script lang="ts" setup>
import { TAB_ITEMS } from '~/utils/routes'

const { t } = useI18n()

const route = useRoute()
const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <div class="fixed bottom-0 z-30 flex w-full items-center border-t border-hairline2 bg-chrome px-2 pt-2 pb-safe backdrop-blur-[24px]">
    <NuxtLink
      v-for="tab in TAB_ITEMS"
      :key="tab.path"
      :to="tab.path"
      class="flex flex-1 flex-col items-center gap-1.5 transition-colors duration-base"
      :class="isActive(tab.path) ? 'text-accent' : 'text-text-mute'"
    >
      <span class="relative flex size-10 items-center justify-center">
        <Transition name="tab-dot">
          <span v-if="isActive(tab.path)" class="absolute inset-0 rounded-full bg-accent-soft" />
        </Transition>

        <UIcon
          :name="tab.icon"
          class="relative size-6 transition-transform duration-base ease-spring"
          :class="isActive(tab.path) ? 'scale-110' : 'scale-100'"
        />
      </span>

      <span class="text-xs">{{ t(tab.labelKey) }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.tab-dot-enter-active {
  transition: transform var(--duration-base) var(--ease-spring), opacity var(--duration-fast) var(--ease-out);
}
.tab-dot-leave-active {
  transition: transform var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out);
}
.tab-dot-enter-from,
.tab-dot-leave-to {
  transform: scale(0.4);
  opacity: 0;
}
</style>
