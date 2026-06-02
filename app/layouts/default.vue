<script lang="ts" setup>
const route = useRoute()
useCategoriesQuery()
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <main class="pb-28">
      <slot />
    </main>
    <UiFab v-if="!route.meta.hideFab" />
    <UiTabBar />
  </div>
</template>
