export const REFRESH_LOCK = 'myday-auth-refresh'

export function withRefreshLock<T>(run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : (navigator as Partial<Navigator>).locks

  return locks ? locks.request(REFRESH_LOCK, run) : run()
}
