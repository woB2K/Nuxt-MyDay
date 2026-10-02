export type TaskFilter = 'all' | 'open' | 'done'

export const taskFilterKeys: TaskFilter[] = ['all', 'open', 'done']

export function hasActiveTaskFilters(filter: TaskFilter, search: string): boolean {
  return filter !== 'all' || search !== ''
}

export function taskQuery(filter: TaskFilter, search: string): Record<string, string> {
  return {
    ...(filter !== 'all' && { filter }),
    ...(search && { search })
  }
}
