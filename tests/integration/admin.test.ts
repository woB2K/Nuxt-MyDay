import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { listUsers, resetPassword } from '../../scripts/admin/admin'
import { prisma, registerUser, resetDb, setupApi } from './helpers'

describe('admin cli', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  let ip = 0

  function login(email: string, password: string) {
    ip += 1
    return $fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': `10.41.${Math.floor(ip / 250)}.${ip % 250}` },
      body: { email, password }
    })
  }

  it('sets a new password, keeps the old one out and signs every session out', async () => {
    const user = await registerUser()
    await login(user.email, 'password123')
    expect(await prisma.refreshToken.count({ where: { userId: user.userId } })).toBeGreaterThan(0)

    await resetPassword(prisma, user.email.toUpperCase(), { password: 'brand-new-pass', rounds: 4 })

    expect(await prisma.refreshToken.count({ where: { userId: user.userId } })).toBe(0)
    await expect(login(user.email, 'password123')).rejects.toMatchObject({ statusCode: 401 })
    await expect(login(user.email, 'brand-new-pass')).resolves.toMatchObject({ user: { id: user.userId } })
  })

  it('generates a password that lets the user in', async () => {
    const user = await registerUser()

    const password = await resetPassword(prisma, user.email, { rounds: 4 })

    expect(password).toMatch(/^[\w-]{16}$/)
    await expect(login(user.email, password)).resolves.toMatchObject({ user: { id: user.userId } })
  })

  it('refuses an unknown email and a password the sign-in form would reject', async () => {
    const user = await registerUser()

    await expect(resetPassword(prisma, 'nobody@test.local', { rounds: 4 })).rejects.toThrow('No user')
    await expect(resetPassword(prisma, user.email, { password: 'short', rounds: 4 })).rejects.toThrow('8 to 30')
  })

  it('lists accounts with the size of their family', async () => {
    await registerUser()

    expect(await listUsers(prisma)).toEqual([expect.objectContaining({ name: 'Test User', family: 1 })])
  })
})
