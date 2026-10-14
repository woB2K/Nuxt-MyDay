<script lang="ts" setup>
interface Props {
  title: string
  body: string
  selected: boolean
  badge?: string
}

const props = withDefaults(defineProps<Props>(), { badge: '' })
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    class="flex w-full items-start gap-3 rounded-2xl border-[1.5px] p-4 text-left transition-colors duration-fast"
    :class="props.selected ? 'border-accent bg-accent-soft' : 'border-hairline bg-elev1'"
    type="button"
    role="radio"
    :aria-checked="props.selected"
    @click="emit('select')"
  >
    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex items-center gap-2">
        <span class="text-[15px] font-semibold text-text">{{ props.title }}</span>
        <span
          v-if="props.badge"
          class="rounded-full bg-elev3 px-2 py-0.5 text-[11px] font-semibold text-text-dim"
        >{{ props.badge }}</span>
      </span>
      <span class="text-[13px] leading-[18px] text-text-dim">{{ props.body }}</span>
    </span>
    <span
      class="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full transition-transform duration-fast ease-spring"
      :class="props.selected ? 'scale-100 bg-accent text-accent-ink' : 'border-2 border-text-mute'"
    >
      <UIcon v-if="props.selected" name="i-lucide-check" class="size-3.5" />
    </span>
  </button>
</template>
