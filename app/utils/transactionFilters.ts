export type TransactionFilterType = 'all' | 'INCOME' | 'EXPENSE'

export interface TransactionFilters {
  type: TransactionFilterType
  categoryIds: string[]
  search: string
}

export function emptyFilters(): TransactionFilters {
  return { type: 'all', categoryIds: [], search: '' }
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return filters.type !== 'all' || filters.categoryIds.length > 0 || filters.search !== ''
}

export function filterQuery(filters: TransactionFilters): Record<string, string> {
  return {
    ...(filters.type !== 'all' && { type: filters.type }),
    ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(',') }),
    ...(filters.search && { search: filters.search })
  }
}

export function filterKey(filters: TransactionFilters): string {
  return [
    filters.type,
    [...filters.categoryIds].sort().join(','),
    filters.search
  ].join('|')
}
