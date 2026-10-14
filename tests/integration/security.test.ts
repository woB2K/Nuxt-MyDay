import { $fetch, fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

describe('security', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  describe('auth middleware', () => {
    it('guards api routes reached through an encoded or differently cased path', async () => {
      const user = await registerUser()
      await $fetch('/api/tasks', { method: 'POST', headers: authHeaders(user.token), body: { title: 'Secret' } })

      for (const path of ['/%61pi/tasks', '/%61pi/tags', '/%61pi/templates', '/API/tasks', '/api/%74asks']) {
        const response = await fetch(path)
        const body = await response.text()

        expect(response.status, path).toBe(401)
        expect(body, path).not.toContain('Secret')
      }
    })
  })

  describe('login rate limit', () => {
    const attempt = (path: string, forwardedFor: string) => fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': forwardedFor },
      body: JSON.stringify({ email: 'nobody@test.local', password: 'wrongpassword1' })
    })

    async function statuses(path: (index: number) => string, forwardedFor: (index: number) => string) {
      const result: number[] = []
      for (let index = 0; index < 11; index++) result.push((await attempt(path(index), forwardedFor(index))).status)
      return result
    }

    it('still counts attempts when the path carries a query or a trailing slash', async () => {
      expect((await statuses(index => `/api/auth/login?n=${index}`, () => '10.250.1.1')).at(-1)).toBe(429)
      expect((await statuses(() => '/api/auth/login/', () => '10.250.1.2')).at(-1)).toBe(429)
    })

    it('counts by the address the nearest proxy added, not the one the client claims', async () => {
      expect((await statuses(() => '/api/auth/login', index => `6.6.6.${index}, 10.250.1.3`)).at(-1)).toBe(429)
    })
  })
})
