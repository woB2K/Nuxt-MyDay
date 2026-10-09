<script lang="ts" setup>
interface Props {
  name?: string
  colorIndex?: number | null
  size?: number
  dashed?: boolean
  ring?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  colorIndex: null,
  size: 40,
  dashed: false,
  ring: ''
})

const MEMBER_INK = ['text-m0', 'text-m1', 'text-m2', 'text-m3']

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())

const tone = computed(() => {
  if (props.dashed) return 'border-[1.5px] border-dashed border-hairline2 text-text-mute'
  if (props.colorIndex === null) return 'bg-elev3 text-text-mute'
  return MEMBER_INK[props.colorIndex % MEMBER_INK.length]
})

const fill = computed(() => {
  if (props.dashed || props.colorIndex === null) return {}

  const soft = `var(--c-m${props.colorIndex % MEMBER_INK.length}-soft)`

  return { backgroundImage: `linear-gradient(${soft}, ${soft})`, backgroundColor: props.ring || 'transparent' }
})

const style = computed(() => ({
  ...fill.value,
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * (props.size <= 20 ? 0.55 : 0.42))}px`,
  fontWeight: props.size <= 20 ? 700 : undefined,
  ...(props.ring && { boxShadow: `0 0 0 ${props.size <= 30 ? 2 : 3}px ${props.ring}` })
}))

const iconSize = computed(() => `${Math.round(props.size * 0.45)}px`)
</script>

<template>
  <span
    class="shrink-0 inline-flex items-center justify-center rounded-full font-display font-semibold leading-none select-none"
    :class="tone"
    :style="style"
  >
    <UIcon
      v-if="props.dashed || props.colorIndex === null || !initial"
      :name="props.dashed ? 'i-lucide-user-plus' : 'i-lucide-user'"
      :style="{ width: iconSize, height: iconSize }"
    />
    <template v-else>{{ initial }}</template>
  </span>
</template>
