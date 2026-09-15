import type { UpdateSettingsInput, UserSettings } from '~~/shared/types'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '~/stores/auth'
import { useApi } from './useApi'

export function useUpdateSettingsMutation() {
  const api = useApi()
  const authStore = useAuthStore()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (body: UpdateSettingsInput) =>
      api<UserSettings>('/api/settings', { method: 'PATCH', body }),
    onSuccess: (settings) => {
      if (authStore.user) authStore.user.settings = settings
    },
    onError: () => {
      useAppToast().error(t('settings.saveError'))
    }
  })
}
