<script lang="ts" setup>
import { useAppLock } from '~/composables/useAppLock'

definePageMeta({ layout: 'auth', middleware: 'auth' })

const maxAttempts = 10

const { t } = useI18n()
const ui = useUiStore()
const authStore = useAuthStore()
const { isLocked, unlock } = useAppLock()
const { mutate: verifyPin, isPending } = useVerifyPinMutation()

const screen = ref<{ clear: () => void, reject: () => void } | null>(null)
const failed = ref(0)
const error = ref('')
const resetOpen = ref(false)

const attemptsLeft = computed(() => Math.max(0, maxAttempts - failed.value))

function leave() {
  const target = ui.lockReturn || '/today'

  ui.lockReturn = '/today'

  return navigateTo(target)
}

watch(isLocked, (locked) => {
  if (!locked) leave()
}, { immediate: true })

function submit(pin: string) {
  error.value = ''

  verifyPin({ pin }, {
    onSuccess: () => {
      failed.value = 0
      unlock()
    },
    onError: (cause) => {
      const status = (cause as { statusCode?: number }).statusCode

      failed.value += 1
      error.value = status === 429
        ? t('pin.tooManyAttempts')
        : t('pin.wrong', { count: attemptsLeft.value })

      screen.value?.reject()
    }
  })
}

async function signOut() {
  try {
    await authStore.logout()
    await navigateTo('/auth/welcome')
  } catch {
    useAppToast().error(t('settings.signOutError'))
  }
}
</script>

<template>
  <div class="relative">
    <UiPinScreen
      ref="screen"
      :title="t('pin.unlockTitle')"
      :subtitle="t('pin.unlockSubtitle')"
      :error="error"
      :disabled="isPending"
      :forgot-label="t('pin.forgot')"
      @submit="submit"
      @forgot="resetOpen = true"
    />

    <button
      class="absolute right-4 top-4 z-10 text-xs font-medium text-text-mute transition-colors duration-fast active:text-danger"
      type="button"
      @click="signOut"
    >
      {{ t('settings.signOut') }}
    </button>

    <PinResetSheet v-model:open="resetOpen" />
  </div>
</template>
