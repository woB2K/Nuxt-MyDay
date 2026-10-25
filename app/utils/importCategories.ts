import type { ImportTransactionsInput } from '~~/shared/types'
import type { ImportRow } from './csvImport'
import { MAX_IMPORT_ROWS } from '~~/shared/schemas/finance'

interface KnownCategory {
  id: string
  name: string
  key?: string | null
  type: 'INCOME' | 'EXPENSE'
  isSystem?: boolean
}

export interface ImportCategoryChoice {
  key: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  rows: number
  match: string | null
}

const lower = (value: string) => value.trim().toLocaleLowerCase()

export function choiceKey(type: string, name: string): string {
  return `${type}:${lower(name)}`
}

export function matchImportCategories(rows: ImportRow[], categories: KnownCategory[], label: (category: KnownCategory) => string): ImportCategoryChoice[] {
  const choices = new Map<string, ImportCategoryChoice>()

  for (const row of rows) {
    const key = choiceKey(row.type, row.category)
    const existing = choices.get(key)

    if (existing) {
      existing.rows += 1
      continue
    }

    const sameType = categories.filter(category => category.type === row.type)
    const match = row.category.trim()
      ? sameType.find(category => lower(category.name) === lower(row.category) || lower(label(category)) === lower(row.category))
      : sameType.find(category => category.isSystem)

    choices.set(key, { key, name: row.category.trim(), type: row.type, rows: 1, match: match?.id ?? null })
  }

  return [...choices.values()].sort((a, b) => b.rows - a.rows)
}

export function importPayload(rows: ImportRow[], choices: ImportCategoryChoice[], fallbackName: string): ImportTransactionsInput['rows'] {
  const byKey = new Map(choices.map(choice => [choice.key, choice]))

  return rows.map((row) => {
    const choice = byKey.get(choiceKey(row.type, row.category))
    const category = choice?.match ? { categoryId: choice.match } : { categoryName: row.category.trim() || fallbackName }

    return {
      fingerprint: row.fingerprint,
      type: row.type,
      amount: row.amount,
      date: row.date,
      ...(row.notes && { notes: row.notes }),
      ...category,
      tags: row.tags
    }
  })
}

export function importBatches<T>(items: T[], size = MAX_IMPORT_ROWS): T[][] {
  const batches: T[][] = []
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size))
  return batches
}

export interface ImportSummary {
  from: string
  to: string
  currencies: string[]
}

export function summarizeImport(rows: ImportRow[]): ImportSummary | null {
  if (rows.length === 0) return null

  const dates = rows.map(row => row.date).sort()

  return {
    from: dates[0]!,
    to: dates.at(-1)!,
    currencies: [...new Set(rows.map(row => row.currency).filter((code): code is string => Boolean(code)))]
  }
}
