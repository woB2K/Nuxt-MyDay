<script lang="ts" setup>
import { provideFabAction } from '~/composables/useFabAction'

const route = useRoute()
useCategoriesQuery()

const fabAction = provideFabAction()
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <main class="pt-safe pb-shell">
      <slot />
    </main>
    <UiFab v-if="!route.meta.hideFab" @click="fabAction?.()" />
    <UiTabBar />
  </div>
</template>
