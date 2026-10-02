<script lang="ts" setup>
interface Props {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000
})
const emit = defineEmits<{ close: [id: string] }>()

const icons = {
  success: 'i-heroicons-check-circle',
  error: 'i-heroicons-x-circle',
  info: 'i-heroicons-information-circle'
}

const colors = {
  success: 'text-success bg-success/10',
  error: 'text-danger bg-danger/10',
  info: 'text-info bg-info/10'
}

let timer: ReturnType<typeof setTimeout>

onMounted(() => {
  timer = setTimeout(emit, props.duration, 'close', props.id)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 rounded-lg bg-elev3 border border-hairline shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
  >
    <div class="flex-none p-1.5 rounded-md" :class="[colors[type]]">
      <UIcon :name="icons[type]" class="size-4" />
    </div>
    <p class="flex-1 text-footnote text-text">
      {{ message }}
    </p>
    <button
      class="flex-none text-text-mute hover:text-text transition-colors duration-fast"
      @click="emit('close', id)"
    >
      <UIcon name="i-heroicons-x-mark" class="size-4" />
    </button>
  </div>
</template>
