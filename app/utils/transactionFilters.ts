export type TransactionFilterType = 'all' | 'INCOME' | 'EXPENSE'

export interface TransactionFilters {
  type: TransactionFilterType
  categoryIds: string[]
  tagIds: string[]
  search: string
  mine: boolean
}

export function emptyFilters(): TransactionFilters {
  return { type: 'all', categoryIds: [], tagIds: [], search: '', mine: false }
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return filters.type !== 'all' || filters.categoryIds.length > 0 || filters.tagIds.length > 0 || filters.search !== '' || filters.mine
}

export function filterQuery(filters: TransactionFilters): Record<string, string> {
  return {
    ...(filters.type !== 'all' && { type: filters.type }),
    ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(',') }),
    ...(filters.tagIds.length > 0 && { tagIds: filters.tagIds.join(',') }),
    ...(filters.search && { search: filters.search }),
    ...(filters.mine && { mine: 'true' })
  }
}

export function filterKey(filters: TransactionFilters): string {
  return [
    filters.type,
    [...filters.categoryIds].sort().join(','),
    [...filters.tagIds].sort().join(','),
    filters.search,
    filters.mine ? 'mine' : ''
  ].join('|')
}
