import { $fetch, fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_AMOUNT, MAX_NOTES_LENGTH } from '../../shared/schemas'
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

  describe('input limits', () => {
    it('rejects oversized notes and amounts with 400 instead of storing or crashing', async () => {
      const user = await registerUser()
      const categories = await $fetch<Array<{ id: string, type: string }>>('/api/categories', { headers: authHeaders(user.token) })
      const expense = categories.find(category => category.type === 'EXPENSE')!
      const spend = (body: object) => $fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(user.token),
        body: { type: 'EXPENSE', amount: 10, categoryId: expense.id, date: '2026-10-01', ...body }
      })

      await expect(spend({ notes: 'x'.repeat(MAX_NOTES_LENGTH + 1) })).rejects.toMatchObject({ statusCode: 400 })
      await expect(spend({ amount: MAX_AMOUNT * 10 })).rejects.toMatchObject({ statusCode: 400 })
      await expect(spend({ amount: MAX_AMOUNT })).resolves.toBeDefined()
    })
  })

  describe('savings', () => {
    it('does not reveal whether another family has an opening balance with a given id', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const opening = await $fetch<{ id: string }>('/api/finance/savings', { method: 'POST', headers: authHeaders(owner.token), body: { amount: 100, type: 'OPENING' } })
      const goal = await $fetch<{ id: string }>('/api/finance/goals', { method: 'POST', headers: authHeaders(stranger.token), body: { name: 'Trip', target: 1000 } })

      await expect($fetch(`/api/finance/savings/${opening.id}`, {
        method: 'PATCH',
        headers: authHeaders(stranger.token),
        body: { goalId: goal.id }
      })).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('response headers', () => {
    it('forbids framing and sniffing and keeps the invite path out of referrers', async () => {
      const user = await registerUser()

      for (const response of [await fetch('/'), await fetch('/api/tasks', { headers: authHeaders(user.token) })]) {
        expect(response.status).toBe(200)
        expect(response.headers.get('x-frame-options')).toBe('DENY')
        expect(response.headers.get('content-security-policy')).toBe('frame-ancestors \'none\'')
        expect(response.headers.get('x-content-type-options')).toBe('nosniff')
        expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
      }
    })
  })
})
