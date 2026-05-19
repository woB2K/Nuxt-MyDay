<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <div class="min-h-dvh bg-bg flex flex-col">
    <slot />
    <UiFab v-if="!route.meta.hideFab" />
    <main class="flex-1 pb-20">
      <UiTabBar />
    </main>
  </div>
</template>
