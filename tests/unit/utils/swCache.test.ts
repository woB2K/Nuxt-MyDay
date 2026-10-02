import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiCacheName, clearApiCache } from '../../../app/utils/swCache'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('clearApiCache', () => {
  it('deletes the api response cache', async () => {
    const remove = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('caches', { delete: remove })

    await clearApiCache()

    expect(remove).toHaveBeenCalledWith(apiCacheName)
  })

  it('does nothing when the Cache API is unavailable', async () => {
    vi.stubGlobal('caches', undefined)

    await expect(clearApiCache()).resolves.toBeUndefined()
  })

  it('swallows a rejected delete instead of breaking logout', async () => {
    vi.stubGlobal('caches', { delete: vi.fn().mockRejectedValue(new Error('storage denied')) })

    await expect(clearApiCache()).resolves.toBeUndefined()
  })
})
