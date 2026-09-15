<script lang="ts" setup>
import { pinLength } from '~~/shared/schemas'

interface Props {
  length?: number
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: pinLength,
  error: '',
  disabled: false
})

const emit = defineEmits<{ submit: [pin: string] }>()

const pin = ref('')
const shaking = ref(false)

const slots = computed(() => Array.from({ length: props.length }, (_, index) => index))
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

let shakeTimer: ReturnType<typeof setTimeout> | null = null

function clear() {
  pin.value = ''
}

function reject() {
  shaking.value = true
  pin.value = ''

  if (shakeTimer) clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => {
    shaking.value = false
  }, 460)
}

function press(digit: string) {
  if (props.disabled || pin.value.length >= props.length) return

  shaking.value = false
  pin.value += digit

  if (pin.value.length === props.length) emit('submit', pin.value)
}

function backspace() {
  if (props.disabled) return

  shaking.value = false
  pin.value = pin.value.slice(0, -1)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Backspace') backspace()
  else if (/^\d$/.test(event.key)) press(event.key)
}

onMounted(() => document.addEventListener('keydown', onKeydown))

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (shakeTimer) clearTimeout(shakeTimer)
})

defineExpose({ clear, reject })
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="flex flex-col items-center gap-2">
      <div class="flex gap-3.5" :class="shaking ? 'animate-pin-shake' : ''">
        <span
          v-for="index in slots"
          :key="index"
          class="size-4 rounded-full border-[1.5px] transition-transform duration-fast ease-spring"
          :class="[
            props.error && shaking
              ? 'border-danger bg-danger scale-110'
              : index < pin.length
                ? 'border-accent bg-accent scale-110'
                : 'border-hairline2 bg-transparent scale-100'
          ]"
        />
      </div>

      <span class="min-h-5 text-sm text-danger">{{ props.error }}</span>
    </div>

    <div class="grid w-full grid-cols-3 gap-4">
      <button
        v-for="key in keys"
        :key="key"
        class="min-h-14 rounded-2xl bg-elev2 font-display text-[28px] font-medium text-text transition-all duration-fast ease-spring active:scale-95 active:bg-elev3 disabled:opacity-40"
        style="aspect-ratio: 1.4 / 1;"
        type="button"
        :disabled="props.disabled"
        @click="press(key)"
      >
        {{ key }}
      </button>

      <span />

      <button
        class="min-h-14 rounded-2xl bg-elev2 font-display text-[28px] font-medium text-text transition-all duration-fast ease-spring active:scale-95 active:bg-elev3 disabled:opacity-40"
        style="aspect-ratio: 1.4 / 1;"
        type="button"
        :disabled="props.disabled"
        @click="press('0')"
      >
        0
      </button>

      <button
        class="min-h-14 flex items-center justify-center rounded-2xl text-text-dim transition-all duration-fast ease-spring active:scale-95 active:bg-elev3 disabled:opacity-40"
        style="aspect-ratio: 1.4 / 1;"
        type="button"
        :aria-label="$t('pin.backspace')"
        :disabled="props.disabled"
        @click="backspace"
      >
        <UIcon name="i-lucide-delete" class="size-6" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes pin-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-5px); }
  60% { transform: translateX(5px); }
  80% { transform: translateX(-2px); }
}

.animate-pin-shake {
  animation: pin-shake 460ms var(--ease-in-out);
}
</style>
