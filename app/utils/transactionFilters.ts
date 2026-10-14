export type TransactionFilterType = 'all' | 'INCOME' | 'EXPENSE'

export interface TransactionFilters {
  type: TransactionFilterType
  categoryIds: string[]
  tagIds: string[]
  search: string
  authorId: string | null
}

export function emptyFilters(): TransactionFilters {
  return { type: 'all', categoryIds: [], tagIds: [], search: '', authorId: null }
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return filters.type !== 'all' || filters.categoryIds.length > 0 || filters.tagIds.length > 0 || filters.search !== '' || filters.authorId !== null
}

export function filterQuery(filters: TransactionFilters): Record<string, string> {
  return {
    ...(filters.type !== 'all' && { type: filters.type }),
    ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(',') }),
    ...(filters.tagIds.length > 0 && { tagIds: filters.tagIds.join(',') }),
    ...(filters.search && { search: filters.search }),
    ...(filters.authorId && { author: filters.authorId })
  }
}

export function filterKey(filters: TransactionFilters): string {
  return [
    filters.type,
    [...filters.categoryIds].sort().join(','),
    [...filters.tagIds].sort().join(','),
    filters.search,
    filters.authorId ?? ''
  ].join('|')
}
