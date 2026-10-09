<script lang="ts" setup>
const model = defineModel<string>({ default: '' })

function openPicker(event: MouseEvent) {
  const input = event.currentTarget as HTMLInputElement

  if (!('showPicker' in input) || !window.matchMedia('(pointer: fine)').matches) return

  input.showPicker()
}
</script>

<template>
  <input
    v-model="model"
    class="appearance-none [&::-webkit-date-and-time-value]:text-left"
    type="date"
    @click="openPicker"
  >
</template>
