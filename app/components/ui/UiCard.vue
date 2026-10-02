<script lang="ts" setup>
interface Props {
  hero?: boolean
  pressable?: boolean
  padding?: number
}

const props = withDefaults(defineProps<Props>(), {
  hero: false,
  pressable: false,
  padding: 16
})
</script>

<template>
  <div
    class="flex flex-col rounded-2xl"
    :class="[
      props.pressable ? 'active:scale-[0.98] transition-transform cursor-pointer' : '',
      props.hero ? 'bg-gradient-to-b from-accent-soft to-elev1' : 'bg-elev2'
    ]"
    :style="{ padding: `${props.padding}px` }"
  >
    <slot />
  </div>
</template>
