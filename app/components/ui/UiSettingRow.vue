<script lang="ts" setup>
interface Props {
  icon: string
  label: string
  sub?: string
  last?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: '',
  last: false,
  clickable: false
})

const emit = defineEmits<{ click: [] }>()

function onClick() {
  if (props.clickable) emit('click')
}
</script>

<template>
  <component
    :is="props.clickable ? 'button' : 'div'"
    class="flex w-full items-center gap-3 px-4 py-3 text-left"
    :class="[
      props.last ? '' : 'border-b border-hairline',
      props.clickable ? 'transition-colors duration-fast active:bg-elev3' : ''
    ]"
    :type="props.clickable ? 'button' : undefined"
    @click="onClick"
  >
    <span class="shrink-0 flex size-8 items-center justify-center rounded-lg bg-elev3 text-text-dim">
      <UIcon :name="props.icon" class="size-4.5" />
    </span>

    <span class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-[15px] font-medium text-text">{{ props.label }}</span>
      <span v-if="props.sub" class="truncate text-xs text-text-mute">{{ props.sub }}</span>
    </span>

    <slot name="trailing">
      <UIcon
        v-if="props.clickable"
        name="i-lucide-chevron-right"
        class="size-4.5 shrink-0 text-text-mute"
      />
    </slot>
  </component>
</template>
