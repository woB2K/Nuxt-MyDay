import { describe, expect, it, vi } from 'vitest'
import { REFRESH_LOCK, withRefreshLock } from '../../../app/utils/refreshLock'

describe('withRefreshLock', () => {
  it('берёт общий лок, если Web Locks есть', async () => {
    const request = vi.fn((_name: string, run: () => Promise<string>) => run())
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true })

    try {
      await expect(withRefreshLock(async () => 'token')).resolves.toBe('token')
      expect(request).toHaveBeenCalledWith(REFRESH_LOCK, expect.any(Function))
    } finally {
      Reflect.deleteProperty(navigator, 'locks')
    }
  })

  it('без Web Locks (http://<LAN-IP>) просто выполняет запрос', async () => {
    Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true })

    try {
      await expect(withRefreshLock(async () => 'token')).resolves.toBe('token')
    } finally {
      Reflect.deleteProperty(navigator, 'locks')
    }
  })
})
