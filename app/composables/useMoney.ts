import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { formatMoney } from '~/utils/formatAmount'

export function useMoney() {
  const ui = useUiStore()
  const { t } = useI18n()
  const toast = useAppToast()
  const authStore = useAuthStore()
  const api = useApi()

  const hidden = computed(() => ui.amountsHidden)

  function toggleLabel(amount: number, sign = ''): string {
    return ui.amountsHidden
      ? t('finance.privacy.show')
      : t('finance.privacy.toggle', { amount: formatMoney(amount, sign) })
  }

  function saveHidden(hidden: boolean) {
    if (!authStore.user) return

    authStore.user.settings.hideAmounts = hidden
    api('/api/settings', { method: 'PATCH', body: { hideAmounts: hidden } }).catch(() => {})
  }

  function toggleHidden() {
    ui.toggleAmountsHidden()
    saveHidden(ui.amountsHidden)
    toast.info(t(ui.amountsHidden ? 'toast.privacy.hidden' : 'toast.privacy.visible'))
  }

  return { hidden, toggleLabel, toggleHidden }
}
