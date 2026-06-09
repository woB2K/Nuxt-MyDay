<script lang="ts" setup>
const route = useRoute()
useCategoriesQuery()

const fabAction = ref<(() => void) | null>(null)
provide('registerFabAction', (fn: (() => void) | null) => {
  fabAction.value = fn
})
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <main class="pb-28">
      <slot />
    </main>
    <UiFab v-if="!route.meta.hideFab" @click="fabAction?.()" />
    <UiTabBar />
  </div>
</template>
