import type { UpdateSettingsInput, UserSettings } from '~~/shared/types'
import { useMutation } from '@tanstack/vue-query'
import { DEFAULT_FINANCE_REMINDER, DEFAULT_TASKS_REMINDER } from '~~/shared/schemas'
import { useAuthStore } from '~/stores/auth'
import { useApi } from './useApi'

export function useUpdateSettingsMutation() {
  const api = useApi()
  const authStore = useAuthStore()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (body: UpdateSettingsInput) =>
      api<UserSettings>('/api/settings', { method: 'PATCH', body }),
    onSuccess: (settings) => {
      if (authStore.user) authStore.user.settings = settings
    },
    onError: () => {
      toast.error(t('settings.saveError'))
    }
  })
}

export function useReminderDefaults() {
  const authStore = useAuthStore()
  const { mutate: saveSettings } = useUpdateSettingsMutation()

  function enableDefaults() {
    const settings = authStore.user?.settings

    if (!settings || settings.remindFinanceAt || settings.remindTasksAt) return

    settings.remindFinanceAt = DEFAULT_FINANCE_REMINDER
    settings.remindTasksAt = DEFAULT_TASKS_REMINDER
    saveSettings({ remindFinanceAt: DEFAULT_FINANCE_REMINDER, remindTasksAt: DEFAULT_TASKS_REMINDER })
  }

  return { enableDefaults }
}
