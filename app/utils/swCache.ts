export const apiCacheName = 'myday-api'

export async function clearApiCache(): Promise<void> {
  if (typeof caches === 'undefined') return

  await caches.delete(apiCacheName).catch(() => false)
}
