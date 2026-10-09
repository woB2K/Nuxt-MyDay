import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { prisma, registerUser, resetDb } from './helpers'

describe('auth api', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  let ip = 0

  function post(path: string, body: unknown) {
    ip += 1
    return $fetch(path, {
      method: 'POST',
      headers: { 'x-forwarded-for': `10.40.${Math.floor(ip / 250)}.${ip % 250}` },
      body
    })
  }

  const valid = { name: 'Max', email: 'max@test.local', password: 'password123' }

  describe('register', () => {
    it.each([
      ['a too short name', { ...valid, name: 'M' }],
      ['an invalid email', { ...valid, email: 'not-an-email' }],
      ['a too short password', { ...valid, password: 'short' }],
      ['a missing field', { email: valid.email, password: valid.password }],
      ['an empty body', undefined]
    ])('answers 400 to %s and creates no user', async (_case, body) => {
      await expect(post('/api/auth/register', body)).rejects.toMatchObject({ statusCode: 400 })

      expect(await prisma.user.count()).toBe(0)
    })

    it('registers a valid user', async () => {
      const result = await post('/api/auth/register', valid) as { user: { email: string }, accessToken: string }

      expect(result.user.email).toBe(valid.email)
      expect(result.accessToken).toBeTruthy()
    })

    it('answers 400 to an email that is already taken', async () => {
      await post('/api/auth/register', valid)

      await expect(post('/api/auth/register', valid)).rejects.toMatchObject({ statusCode: 400 })
      expect(await prisma.user.count()).toBe(1)
    })
  })

  describe('login', () => {
    it.each([
      ['an invalid email', { email: 'not-an-email', password: 'password123' }],
      ['a too short password', { email: 'max@test.local', password: 'short' }],
      ['an empty body', undefined]
    ])('answers 400 to %s', async (_case, body) => {
      await expect(post('/api/auth/login', body)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('logs in with the right password', async () => {
      const { email } = await registerUser()

      await expect(post('/api/auth/login', { email, password: 'password123' })).resolves.toMatchObject({ accessToken: expect.any(String) })
    })

    it('answers 401 to a wrong password', async () => {
      const { email } = await registerUser()

      await expect(post('/api/auth/login', { email, password: 'wrong-password' })).rejects.toMatchObject({ statusCode: 401 })
    })
  })
})
