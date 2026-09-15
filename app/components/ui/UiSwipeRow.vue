<script lang="ts" setup>
export interface SwipeAction {
  label: string
  icon: string
  gradient?: string
  inkColor?: string
}

interface Props {
  completed?: boolean
  completable?: boolean
  deletable?: boolean
  rightAction?: SwipeAction
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
  completable: false,
  deletable: true
})

const emit = defineEmits<{ complete: [], delete: [] }>()

const THRESHOLD = 90
const AXIS_LOCK = 8
const MAX_PULL = 132
const RUBBER = 0.28

const offset = ref(0)
const dragging = ref(false)
const revealed = ref<'none' | 'left' | 'right'>('none')

let startX = 0
let startY = 0
let axis: 'none' | 'x' | 'y' = 'none'
let swiped = false

const rightEnabled = computed(() => props.completable || props.rightAction !== undefined)
const passedThreshold = computed(() => Math.abs(offset.value) >= THRESHOLD)

const doneAction = computed<SwipeAction>(() => props.rightAction ?? {
  label: '',
  icon: 'i-lucide-check',
  gradient: 'linear-gradient(90deg, var(--c-success) 0%, rgba(52, 211, 153, 0.15) 100%)',
  inkColor: 'var(--c-accent-ink)'
})

function resist(dx: number) {
  const distance = Math.abs(dx)

  if (distance <= MAX_PULL) return dx

  return Math.sign(dx) * (MAX_PULL + (distance - MAX_PULL) * RUBBER)
}

function capture(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null

  if (!target || typeof target.setPointerCapture !== 'function') return
  if (typeof event.pointerId !== 'number') return

  target.setPointerCapture(event.pointerId)
}

function onPointerDown(event: PointerEvent) {
  swiped = false

  if (!rightEnabled.value && !props.deletable) return

  startX = event.clientX
  startY = event.clientY
  axis = 'none'
  dragging.value = true
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  const dx = event.clientX - startX
  const dy = event.clientY - startY

  if (axis === 'none') {
    if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return

    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'

    if (axis === 'x') capture(event)
  }

  if (axis === 'y') return

  if ((dx > 0 && !rightEnabled.value) || (dx < 0 && !props.deletable)) {
    offset.value = 0
    return
  }

  swiped = true
  offset.value = resist(dx)
  revealed.value = dx > 0 ? 'right' : 'left'
}

function onPointerUp() {
  if (!dragging.value) return

  const dx = offset.value

  dragging.value = false
  axis = 'none'
  offset.value = 0

  if (dx === 0) revealed.value = 'none'
  if (Math.abs(dx) < THRESHOLD) return

  if (dx > 0 && rightEnabled.value) emit('complete')
  if (dx < 0 && props.deletable) emit('delete')
}

function onSettled() {
  if (!dragging.value && offset.value === 0) revealed.value = 'none'
}

function onClickCapture(event: MouseEvent) {
  if (!swiped) return

  swiped = false
  event.stopPropagation()
  event.preventDefault()
}
</script>

<template>
  <div class="relative overflow-hidden" @click.capture="onClickCapture">
    <div
      v-if="rightEnabled && revealed === 'right'"
      class="absolute inset-y-0 left-0 right-0 flex items-center justify-start px-5 gap-2"
      :style="{ background: doneAction.gradient }"
    >
      <UIcon
        :name="doneAction.icon"
        class="w-6 h-6 transition-transform duration-fast"
        :class="passedThreshold ? 'scale-110' : 'scale-100'"
        :style="{ color: doneAction.inkColor }"
      />
      <span
        v-if="doneAction.label"
        class="text-sm font-bold"
        :style="{ color: doneAction.inkColor }"
      >{{ doneAction.label }}</span>
    </div>

    <div
      v-if="props.deletable && revealed === 'left'"
      class="absolute inset-y-0 left-0 right-0 flex items-center justify-end px-5 bg-danger"
    >
      <UIcon
        name="i-lucide-trash-2"
        class="w-6 h-6 text-white transition-transform duration-fast"
        :class="passedThreshold ? 'scale-110' : 'scale-100'"
      />
    </div>

    <div
      class="relative bg-elev1 touch-pan-y select-none"
      :style="{
        transform: `translateX(${offset}px)`,
        transition: dragging ? 'none' : 'transform var(--duration-swipe) var(--ease-spring)'
      }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @transitionend="onSettled"
    >
      <slot />
    </div>
  </div>
</template>
