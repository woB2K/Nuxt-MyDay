<script lang="ts" setup>
interface Props {
  modelValue?: string
  placeholder?: string
  label?: string
  type?: 'text' | 'password' | 'email' | 'number'
  multiline?: boolean
  rows?: number
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 3
})

// классический паттерн для Vue3, до версии 3.4
// в компоненте UiSwitch более удобный метод для Vue 3.4+
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue ?? '',
  set: val => emit('update:modelValue', val)
})

const focused = ref<boolean>(false)

const showPassword = ref<boolean>(false)

const inputType = computed(() => {
  return props.type === 'password' && showPassword.value ? 'text' : props.type
})
</script>

<template>
  <div class="flex flex-col text-text w-full gap-1">
    <label v-if="props.label" class="text-text-dim ml-2">{{ props.label }}</label>
    <div
      class="flex bg-elev2 p-2 rounded-md gap-2 items-center border"
      :class="{
        'border-accent ring-2 ring-accent-soft': focused && !props.error,
        'border-danger': props.error,
        'border-hairline': !focused && !props.error
      }"
    >
      <div v-if="$slots.icon" class="flex items-center" :class="{ 'text-accent': focused }">
        <slot name="icon" />
      </div>
      <component
        :is="multiline ? 'textarea' : 'input'"
        v-model="value"
        :type="multiline ? undefined : inputType"
        :rows="multiline ? props.rows : undefined"
        class="outline-none bg-transparent flex-1"
        :placeholder="props.placeholder"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button v-if="props.type === 'password'" type="button" class="flex items-center ml-auto" @click.prevent="showPassword = !showPassword">
        <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
      </button>
      <div v-else-if="$slots.trailing" class="flex items-center ml-auto">
        <slot name="trailing" />
      </div>
    </div>
    <p v-if="props.error" class="text-error ml-2">
      {{ props.error }}
    </p>
  </div>
</template>
