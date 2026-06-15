import { SignJWT } from 'jose'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../../server/utils/jwt'

afterEach(() => {
  vi.useRealTimers()
})

describe('signAccessToken / verifyAccessToken', () => {
  it('roundtrip returns the same userId', async () => {
    const userId = 'user-abc-123'
    const token = await signAccessToken(userId)
    const result = await verifyAccessToken(token)
    expect(result).toBe(userId)
  })

  it('throws on tampered signature', async () => {
    const token = await signAccessToken('user-123')
    const [header, payload] = token.split('.')
    const tampered = `${header}.${payload}.invalidsignature`
    await expect(verifyAccessToken(tampered)).rejects.toThrow()
  })

  it('throws on token signed with wrong secret', async () => {
    const wrongSecret = new TextEncoder().encode('completely-different-secret-32ch!')
    const token = await new SignJWT({ sub: 'user-123' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(wrongSecret)
    await expect(verifyAccessToken(token)).rejects.toThrow()
  })

  it('throws on expired token', async () => {
    vi.useFakeTimers()
    const token = await signAccessToken('user-123')
    vi.advanceTimersByTime(16 * 60 * 1000)
    await expect(verifyAccessToken(token)).rejects.toThrow()
  })
})

describe('signRefreshToken / verifyRefreshToken', () => {
  it('roundtrip returns the same userId', async () => {
    const userId = 'user-xyz-456'
    const token = await signRefreshToken(userId)
    const result = await verifyRefreshToken(token)
    expect(result).toBe(userId)
  })

  it('access token is rejected by verifyRefreshToken (different secrets)', async () => {
    // ACCESS_SECRET !== REFRESH_SECRET so cross-verification must fail
    const token = await signAccessToken('user-123')
    await expect(verifyRefreshToken(token)).rejects.toThrow()
  })

  it('throws on tampered signature', async () => {
    const token = await signRefreshToken('user-456')
    const [header, payload] = token.split('.')
    const tampered = `${header}.${payload}.invalidsignature`
    await expect(verifyRefreshToken(tampered)).rejects.toThrow()
  })
})
