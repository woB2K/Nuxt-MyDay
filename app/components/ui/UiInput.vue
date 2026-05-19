<script lang="ts" setup>
interface Props {
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

const model = defineModel<string>({ default: '' })

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
      <textarea
        v-if="multiline"
        v-model="model"
        :rows="props.rows"
        class="outline-none bg-transparent flex-1 resize-none"
        :placeholder="props.placeholder"
        @focus="focused = true"
        @blur="focused = false"
      />
      <input
        v-else
        v-model="model"
        :type="inputType"
        class="outline-none bg-transparent flex-1"
        :placeholder="props.placeholder"
        @focus="focused = true"
        @blur="focused = false"
      >
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
