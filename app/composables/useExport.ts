import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { periodRange } from '~/utils/period'
import { filterQuery } from '~/utils/transactionFilters'
import { useApi } from './useApi'

export function useTransactionExport() {
  const api = useApi()
  const { locale } = useI18n()
  const exporting = ref(false)

  async function exportCsv(period: Period, filters: TransactionFilters) {
    exporting.value = true

    try {
      const range = periodRange(period)
      const csv = await api<string>('/api/finance/export', { query: { ...range, ...filterQuery(filters), lang: locale.value } })
      const name = `${['myday', range?.from, range?.to].filter(Boolean).join('-')}.csv`
      const file = new File([csv], name, { type: 'text/csv' })

      if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }).catch(() => {})
        return
      }

      const url = URL.createObjectURL(file)
      const link = Object.assign(document.createElement('a'), { href: url, download: name })
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      exporting.value = false
    }
  }

  return { exportCsv, exporting }
}
