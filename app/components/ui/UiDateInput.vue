<script lang="ts" setup>
const model = defineModel<string>({ default: '' })

function openPicker(event: MouseEvent) {
  const input = event.currentTarget as HTMLInputElement

  if (!('showPicker' in input) || !window.matchMedia('(pointer: fine)').matches) return

  input.showPicker()
}
</script>

<template>
  <input v-model="model" type="date" @click="openPicker">
</template>
