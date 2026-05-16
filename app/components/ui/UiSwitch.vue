<script lang="ts" setup>
const modelValue = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    role="switch"
    :aria-checked="modelValue"
    class="relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    :class="modelValue ? 'bg-accent' : 'bg-elev3'"
    style="width: 51px; height: 31px;"
    @click="modelValue = !modelValue"
  >
    <span
      class="pointer-events-none absolute top-[2px] left-0 size-[27px] rounded-full bg-white shadow-sm transition-transform duration-200"
      :class="modelValue ? 'translate-x-[22px]' : 'translate-x-[2px]'"
    />
  </button>
</template>
