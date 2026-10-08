<script lang="ts" setup>
const model = defineModel<string>({ default: '' })

const display = computed(() => formatAmountInput(model.value))
const width = computed(() => `${Math.max(display.value.length, 1) + 0.5}ch`)

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const caret = input.selectionStart ?? input.value.length
  const charsBeforeCaret = countAmountChars(input.value.slice(0, caret))

  const raw = parseAmountInput(input.value)
  const text = formatAmountInput(raw)
  const position = caretAfterAmountChars(text, charsBeforeCaret)

  input.value = text
  input.setSelectionRange(position, position)
  model.value = raw
}
</script>

<template>
  <input
    :value="display"
    class="min-w-0 max-w-full bg-transparent outline-none text-center"
    :style="{ width }"
    inputmode="decimal"
    placeholder="0"
    type="text"
    @input="onInput"
  >
</template>
