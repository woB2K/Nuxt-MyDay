import type { PinAttemptInput, PinStatus, ResetPinInput, SetPinInput, UserSettings } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '~/stores/auth'
import { useApi } from './useApi'

export function usePinStatusQuery() {
  const api = useApi()

  return useQuery({
    queryKey: ['pin'],
    queryFn: () => api<PinStatus>('/api/settings/pin')
  })
}

function useSettingsWriter() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  return (settings: UserSettings) => {
    if (authStore.user) authStore.user.settings = settings

    queryClient.invalidateQueries({ queryKey: ['pin'] })
  }
}

export function useSetPinMutation() {
  const api = useApi()
  const apply = useSettingsWriter()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (body: SetPinInput) =>
      api<UserSettings>('/api/settings/pin', { method: 'PUT', body }),
    onSuccess: (settings) => {
      apply(settings)
      useAppToast().success(t('toast.pin.saved'))
    }
  })
}

export function useDisablePinMutation() {
  const api = useApi()
  const apply = useSettingsWriter()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (body: PinAttemptInput) =>
      api<UserSettings>('/api/settings/pin', { method: 'DELETE', body }),
    onSuccess: (settings) => {
      apply(settings)
      useAppToast().success(t('toast.pin.disabled'))
    }
  })
}

export function useVerifyPinMutation() {
  const api = useApi()

  return useMutation({
    mutationFn: (body: PinAttemptInput) =>
      api<{ ok: true }>('/api/settings/pin/verify', { method: 'POST', body })
  })
}

export function useResetPinMutation() {
  const api = useApi()
  const apply = useSettingsWriter()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (body: ResetPinInput) =>
      api<UserSettings>('/api/settings/pin/reset', { method: 'POST', body }),
    onSuccess: (settings) => {
      apply(settings)
      useAppToast().success(t('toast.pin.reset'))
    }
  })
}
