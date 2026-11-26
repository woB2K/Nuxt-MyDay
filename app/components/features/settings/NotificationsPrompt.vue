<script lang="ts" setup>
import { readPushPromptSeen, writePushPromptSeen } from '~/utils/push'

const { t } = useI18n()
const toast = useAppToast()
const authStore = useAuthStore()
const ui = useUiStore()
const { availability, permission, subscribed, ready, busy, enable } = usePush()
const { enableDefaults } = useReminderDefaults()

const seen = ref(readPushPromptSeen())
const open = ref(false)

const due = computed(() => {
  if (seen.value || !ready.value || !authStore.accessToken || !authStore.user || ui.isLocked) return false

  return availability.value === 'ready' && permission.value === 'default' && !subscribed.value
})

watch(due, (value) => {
  if (value) open.value = true
}, { immediate: true })

function close() {
  open.value = false
  seen.value = true
  writePushPromptSeen()
}

function onOpenChange(value: boolean) {
  if (!value) close()
}

async function turnOn() {
  const outcome = await enable()

  close()

  if (outcome === 'enabled') {
    enableDefaults()
    toast.success(t('notifications.enabled'))
  } else if (outcome === 'denied') {
    toast.info(t('notifications.denied'))
  } else {
    toast.error(t('notifications.failed'))
  }
}

function configure() {
  close()
  navigateTo('/settings/notifications')
}
</script>

<template>
  <UiSheet :open="open" @update:open="onOpenChange">
    <div class="flex flex-col items-center text-center" data-push-prompt>
      <span class="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <UIcon name="i-lucide-bell-ring" class="size-7" />
      </span>

      <h2 class="mt-4 text-xl font-bold text-text">
        {{ t('notifications.prompt.title') }}
      </h2>
      <p class="mt-2 text-[15px] leading-5 text-text-dim">
        {{ t('notifications.prompt.body') }}
      </p>

      <UiButton class="mt-6 w-full" :loading="busy" data-push-enable @click="turnOn">
        {{ t('notifications.prompt.enable') }}
      </UiButton>

      <div class="mt-2 flex items-center justify-center gap-1 text-[15px] font-semibold">
        <button class="h-11 px-3 text-text-dim" type="button" data-push-later @click="close">
          {{ t('notifications.prompt.later') }}
        </button>
        <span class="text-text-mute">·</span>
        <button class="h-11 px-3 text-accent" type="button" data-push-configure @click="configure">
          {{ t('notifications.prompt.configure') }}
        </button>
      </div>
    </div>
  </UiSheet>
</template>
