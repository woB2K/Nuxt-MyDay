<script lang="ts" setup>
interface Props {
  open: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

function close() {
  emit('update:open', false)
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="scrim">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[8px]"
        @click="close"
      />
    </Transition>

    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-elev2 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-hairline2" />
        </div>
        <div class="px-5 pt-2 pb-4">
          <h2 class="text-lg font-semibold mb-4">
            {{ title }}
          </h2>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim-enter-active,
.scrim-leave-active {
  transition: opacity 240ms ease;
}
.scrim-enter-from,
.scrim-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
