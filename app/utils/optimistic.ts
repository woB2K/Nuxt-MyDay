import type { QueryClient, QueryKey } from '@tanstack/vue-query'

export type CacheSnapshot = [QueryKey, unknown][]

export async function snapshotQueries(queryClient: QueryClient, ...keys: QueryKey[]): Promise<CacheSnapshot> {
  await Promise.all(keys.map(queryKey => queryClient.cancelQueries({ queryKey })))

  return keys.flatMap(queryKey => queryClient.getQueriesData({ queryKey }))
}

export function restoreQueries(queryClient: QueryClient, snapshot: CacheSnapshot = []): void {
  snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
}

export function invalidateWhenSettled(queryClient: QueryClient, ...keys: QueryKey[]): void {
  if (queryClient.isMutating() > 1) return

  keys.forEach(queryKey => queryClient.invalidateQueries({ queryKey }))
}
