<script lang="ts" setup>
const uiStore = useUiStore()

const { inset: keyboard } = useKeyboardInset()

const stack = ref<HTMLElement | null>(null)
const stackHeight = ref(0)

const style = computed(() => keyboard.value > 0
  ? { bottom: `calc(${keyboard.value}px + 1rem)` }
  : undefined)

watchEffect(() => {
  uiStore.toastStackHeight = keyboard.value > 0 ? 0 : stackHeight.value
})

let observer: ResizeObserver | undefined

onMounted(() => {
  if (!stack.value) return

  observer = new ResizeObserver(([entry]) => {
    stackHeight.value = entry ? Math.round(entry.contentRect.height) : 0
  })
  observer.observe(stack.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  uiStore.toastStackHeight = 0
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="stack"
      class="fixed bottom-toast inset-x-5 z-[60] flex flex-col gap-2 pointer-events-none"
      :style="style"
    >
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
  transition: all var(--duration-base) var(--ease-spring);
}
.toast-leave-active {
  transition: all var(--duration-base) var(--ease-out);
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
