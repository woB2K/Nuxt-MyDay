<script lang="ts" setup>
interface Props {
  title: string
  subtitle?: string
  error?: string
  disabled?: boolean
  forgotLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  error: '',
  disabled: false,
  forgotLabel: ''
})

const emit = defineEmits<{ submit: [pin: string], forgot: [] }>()

const pad = ref<{ clear: () => void, reject: () => void } | null>(null)

defineExpose({
  clear: () => pad.value?.clear(),
  reject: () => pad.value?.reject()
})
</script>

<template>
  <div class="relative min-h-dvh flex flex-col items-center justify-between overflow-hidden px-8 pt-16 pb-7">
    <div
      class="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[80px]"
    />

    <div class="relative flex flex-col items-center gap-3">
      <span class="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <UIcon name="i-lucide-lock" class="size-7" />
      </span>

      <h1 class="text-[26px] font-bold text-text">
        {{ props.title }}
      </h1>

      <p v-if="props.subtitle" class="text-center text-sm text-text-dim">
        {{ props.subtitle }}
      </p>
    </div>

    <div class="relative w-full">
      <UiPinPad
        ref="pad"
        :error="props.error"
        :disabled="props.disabled"
        @submit="emit('submit', $event)"
      />
    </div>

    <button
      v-if="props.forgotLabel"
      class="relative text-sm font-medium text-text-dim transition-colors duration-fast active:text-accent"
      type="button"
      @click="emit('forgot')"
    >
      {{ props.forgotLabel }}
    </button>

    <span v-else class="h-5" />
  </div>
</template>
