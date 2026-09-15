<script lang="ts" setup>
interface Props {
  open: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const DISMISS = 96
const RUBBER = 0.22

const panel = ref<HTMLElement | null>(null)
const panelHeight = ref(0)
const drag = ref(0)
const dragging = ref(false)
const closing = ref(false)

let startY = 0

const progress = computed(() => panelHeight.value
  ? Math.min(1, drag.value / panelHeight.value)
  : 0)

const panelStyle = computed(() => drag.value === 0
  ? undefined
  : {
      transform: `translateY(${drag.value}px)`,
      transition: dragging.value ? 'none' : 'transform var(--duration-base) var(--ease-out)'
    })

const scrimStyle = computed(() => drag.value === 0
  ? undefined
  : {
      opacity: String(1 - progress.value),
      transition: dragging.value ? 'none' : 'opacity var(--duration-base) var(--ease-out)'
    })

function close() {
  emit('update:open', false)
}

function onPointerDown(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null

  startY = event.clientY
  panelHeight.value = panel.value?.offsetHeight ?? 0
  dragging.value = true

  if (target && typeof target.setPointerCapture === 'function' && typeof event.pointerId === 'number') {
    target.setPointerCapture(event.pointerId)
  }
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  const dy = event.clientY - startY

  drag.value = dy < 0 ? dy * RUBBER : dy
}

function onPointerUp() {
  if (!dragging.value) return

  dragging.value = false

  if (drag.value < DISMISS) {
    drag.value = 0
    return
  }

  closing.value = true
  drag.value = panelHeight.value || window.innerHeight
  setTimeout(close, 180)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(() => props.open, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''

  if (value) {
    drag.value = 0
    closing.value = false
    document.addEventListener('keydown', onKeydown)
    return
  }

  document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="scrim">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[8px]"
        :style="scrimStyle"
        @click="close"
      />
    </Transition>

    <Transition name="sheet" @after-leave="drag = 0">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-50"
        :class="{ 'pointer-events-none': closing }"
        :style="panelStyle"
      >
        <div ref="panel" class="max-h-[88dvh] overflow-y-auto rounded-t-2xl bg-elev2 shadow-sheet">
          <div
            class="touch-none select-none pt-3 pb-1"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <div class="mx-auto h-1 w-10 rounded-full bg-hairline2" />
          </div>

          <div class="px-5 pt-2 pb-safe">
            <h2
              class="mb-4 touch-none select-none text-lg font-semibold"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              {{ title }}
            </h2>
            <slot />
          </div>
        </div>

        <div class="absolute inset-x-0 top-full h-1/2 bg-elev2" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim-enter-active,
.scrim-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.scrim-enter-from,
.scrim-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  transition: transform var(--duration-sheet) var(--ease-spring);
}
.sheet-leave-active {
  transition: transform var(--duration-base) var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
