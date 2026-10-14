import { useUiStore } from '~/stores/ui'
import { formatMoney } from '~/utils/formatAmount'

export function useMoney() {
  const ui = useUiStore()
  const { t } = useI18n()
  const toast = useAppToast()

  const hidden = computed(() => ui.amountsHidden)

  function toggleLabel(amount: number, sign = ''): string {
    return ui.amountsHidden
      ? t('finance.privacy.show')
      : t('finance.privacy.toggle', { amount: formatMoney(amount, sign) })
  }

  function toggleHidden() {
    ui.toggleAmountsHidden()
    toast.info(t(ui.amountsHidden ? 'toast.privacy.hidden' : 'toast.privacy.visible'))
  }

  return { hidden, toggleLabel, toggleHidden }
}
