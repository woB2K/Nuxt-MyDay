<script lang="ts" setup>
interface Person {
  name: string
  colorIndex: number | null
}

interface Props {
  members: Person[]
  size?: number
  ring?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  ring: 'var(--c-bg)'
})

const overlap = computed(() => `-${Math.round(props.size * 0.3)}px`)
</script>

<template>
  <span class="inline-flex items-center">
    <UiAvatar
      v-for="(member, index) in props.members"
      :key="index"
      :name="member.name"
      :color-index="member.colorIndex"
      :size="props.size"
      :ring="props.ring"
      class="relative"
      :style="{ zIndex: props.members.length - index, marginLeft: index === 0 ? undefined : overlap }"
    />
  </span>
</template>
