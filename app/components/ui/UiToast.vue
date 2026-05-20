<script lang="ts" setup>
const uiStore = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-28 inset-x-5 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <UiToastItem
          v-for="toast in uiStore.queue"
          :key="toast.id"
          v-bind="toast"
          class="pointer-events-auto"
          @close="uiStore.removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 240ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
