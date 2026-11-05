import type { Period } from '~/utils/period'
import type { TransactionFilters } from '~/utils/transactionFilters'
import { periodRange } from '~/utils/period'
import { filterQuery } from '~/utils/transactionFilters'
import { useApi } from './useApi'

function useCsvDownload() {
  const api = useApi()
  const exporting = ref(false)

  async function download(url: string, prefix: string, period: Period, query: Record<string, unknown> = {}) {
    exporting.value = true

    try {
      const range = periodRange(period)
      const csv = await api<string>(url, { query: { ...range, ...query } })
      const name = `${[prefix, range?.from, range?.to].filter(Boolean).join('-')}.csv`
      const file = new File([csv], name, { type: 'text/csv' })

      if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }).catch(() => {})
        return
      }

      const href = URL.createObjectURL(file)
      const link = Object.assign(document.createElement('a'), { href, download: name })
      link.click()
      URL.revokeObjectURL(href)
    } finally {
      exporting.value = false
    }
  }

  return { download, exporting }
}

export function useTransactionExport() {
  const { locale } = useI18n()
  const { download, exporting } = useCsvDownload()

  function exportCsv(period: Period, filters: TransactionFilters) {
    return download('/api/finance/export', 'myday', period, { ...filterQuery(filters), lang: locale.value })
  }

  return { exportCsv, exporting }
}

export function useSavingsExport() {
  const { download, exporting } = useCsvDownload()

  function exportCsv(period: Period) {
    return download('/api/finance/savings/export', 'myday-savings', period)
  }

  return { exportCsv, exporting }
}
