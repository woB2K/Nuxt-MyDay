<script lang="ts" setup>
const props = defineProps<{ open: boolean }>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()

const { data: status } = usePinStatusQuery()
const { mutate: resetPin, isPending } = useResetPinMutation()

const password = ref('')
const error = ref('')

const viaPassword = computed(() => status.value?.resetVia !== 'oauth')

watch(() => props.open, (open) => {
  if (!open) return

  password.value = ''
  error.value = ''
})

function close() {
  emit('update:open', false)
}

function submit() {
  if (!password.value) {
    error.value = t('pin.reset.passwordRequired')
    return
  }

  error.value = ''

  resetPin({ password: password.value }, {
    onSuccess: close,
    onError: (cause) => {
      const status = (cause as { statusCode?: number }).statusCode

      error.value = status === 409
        ? t('pin.reset.oauthOnly')
        : status === 429
          ? t('pin.tooManyAttempts')
          : t('pin.reset.wrongPassword')
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('pin.reset.title')" @update:open="emit('update:open', $event)">
    <form v-if="viaPassword" class="flex flex-col gap-4" @submit.prevent="submit">
      <p class="text-sm text-text-dim">
        {{ t('pin.reset.passwordHint') }}
      </p>

      <UiInput v-model="password" :label="t('auth.password')" type="password" />

      <span v-if="error" class="text-sm text-danger">{{ error }}</span>

      <UiButton class="w-full" type="submit" :disabled="isPending">
        {{ t('pin.reset.submit') }}
      </UiButton>
    </form>

    <div v-else class="flex flex-col gap-4">
      <p class="text-sm text-text-dim">
        {{ t('pin.reset.oauthHint') }}
      </p>

      <UiButton class="w-full" variant="secondary" @click="close">
        {{ t('general.close') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
