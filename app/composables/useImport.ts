import type { ImportTransactionsInput, ImportTransactionsResult } from '~~/shared/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { importBatches } from '~/utils/importCategories'
import { useApi } from './useApi'

const IMPORT_SCOPED_KEYS = ['transactions', 'summary', 'categories', 'financeTags', 'trash', 'household']

export function useImportTransactionsMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const done = ref(0)

  const mutation = useMutation({
    mutationFn: async (rows: ImportTransactionsInput['rows']) => {
      const total: ImportTransactionsResult = { created: 0, existing: 0, categories: 0, tags: 0 }
      done.value = 0

      for (const batch of importBatches(rows)) {
        const result = await api<ImportTransactionsResult>('/api/finance/import', { method: 'POST', body: { rows: batch } })
        total.created += result.created
        total.existing += result.existing
        total.categories += result.categories
        total.tags += result.tags
        done.value += batch.length
      }

      return total
    },
    onSettled: () => Promise.all(IMPORT_SCOPED_KEYS.map(key => queryClient.invalidateQueries({ queryKey: [key] })))
  })

  return { ...mutation, done }
}
