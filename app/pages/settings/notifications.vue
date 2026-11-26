<script lang="ts" setup>
import { DEFAULT_FINANCE_REMINDER, DEFAULT_TASKS_REMINDER } from '~~/shared/schemas'

definePageMeta({ hideFab: true })

const { t } = useI18n()
const toast = useAppToast()
const authStore = useAuthStore()
const { mutate: saveSettings } = useUpdateSettingsMutation()
const { availability, permission, subscribed, busy, enable, disable, sendTest } = usePush()
const { enableDefaults } = useReminderDefaults()

const settings = computed(() => authStore.user?.settings)
const deviceBlocked = computed(() => availability.value !== 'ready' || permission.value === 'denied')

const deviceHint = computed(() => {
  if (availability.value !== 'ready') return t(`notifications.hint.${availability.value}`)
  if (permission.value === 'denied') return t('notifications.hint.denied')

  return t(subscribed.value ? 'notifications.hint.on' : 'notifications.hint.off')
})

async function toggleDevice(on: boolean) {
  if (!on) {
    if (!await disable()) toast.error(t('notifications.disableError'))
    return
  }

  const outcome = await enable()

  if (outcome === 'enabled') {
    enableDefaults()
    toast.success(t('notifications.enabled'))
  } else if (outcome === 'denied') {
    toast.error(t('notifications.denied'))
  } else {
    toast.error(t('notifications.failed'))
  }
}

type ReminderField = 'remindFinanceAt' | 'remindTasksAt'

const defaults: Record<ReminderField, string> = {
  remindFinanceAt: DEFAULT_FINANCE_REMINDER,
  remindTasksAt: DEFAULT_TASKS_REMINDER
}

function setReminder(field: ReminderField, value: string | null) {
  if (authStore.user) authStore.user.settings[field] = value
  saveSettings({ [field]: value })
}

const reminders = computed(() => [
  { field: 'remindFinanceAt' as const, icon: 'i-lucide-wallet', key: 'finance' },
  { field: 'remindTasksAt' as const, icon: 'i-lucide-list-checks', key: 'tasks' }
])

const testing = ref(false)

async function runTest() {
  testing.value = true

  try {
    const { sent } = await sendTest()
    if (sent > 0) toast.success(t('notifications.testSent', sent))
    else toast.info(t('notifications.testNone'))
  } catch {
    toast.error(t('notifications.testError'))
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <UiRoundBtn class="mb-1 self-start" @click="navigateTo('/settings')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('notifications.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('notifications.subtitle') }}</span>
    </div>

    <UiCard :padding="0">
      <UiSettingRow icon="i-lucide-bell" :label="t('notifications.device')" :sub="deviceHint" last>
        <template #trailing>
          <UiSwitch
            v-if="availability !== 'unsupported'"
            :model-value="subscribed"
            :disabled="deviceBlocked || busy"
            :aria-label="t('notifications.device')"
            data-push-device
            @update:model-value="toggleDevice"
          />
        </template>
      </UiSettingRow>
    </UiCard>

    <span class="mt-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-text-mute">
      {{ t('notifications.types') }}
    </span>

    <UiCard :padding="0">
      <template v-for="reminder in reminders" :key="reminder.field">
        <UiSettingRow
          :icon="reminder.icon"
          :label="t(`notifications.${reminder.key}.label`)"
          :sub="t(`notifications.${reminder.key}.sub`)"
        >
          <template #trailing>
            <UiSwitch
              :model-value="!!settings?.[reminder.field]"
              :aria-label="t(`notifications.${reminder.key}.label`)"
              :data-reminder="reminder.key"
              @update:model-value="setReminder(reminder.field, $event ? defaults[reminder.field] : null)"
            />
          </template>
        </UiSettingRow>

        <UiSettingRow
          v-if="settings?.[reminder.field]"
          icon="i-lucide-clock"
          :label="t('notifications.time')"
        >
          <template #trailing>
            <UiTimeInput
              :model-value="settings[reminder.field]!"
              :label="t(`notifications.${reminder.key}.label`)"
              :data-reminder-time="reminder.key"
              @update:model-value="setReminder(reminder.field, $event)"
            />
          </template>
        </UiSettingRow>
      </template>

      <UiSettingRow
        icon="i-lucide-flame"
        :label="t('notifications.habits.label')"
        :sub="t('notifications.habits.sub')"
        clickable
        last
        @click="navigateTo('/habits')"
      />
    </UiCard>

    <span class="px-1 text-xs text-text-mute">{{ t('notifications.typesHint') }}</span>

    <UiButton
      v-if="subscribed"
      class="mt-3 w-full"
      variant="secondary"
      :loading="testing"
      data-push-test
      @click="runTest"
    >
      {{ t('notifications.test') }}
    </UiButton>
  </div>
</template>
