import type { ExtraServer } from './helpers'
import { $fetch } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi, startExtraServer } from './helpers'

describe('closed registration', async () => {
  await setupApi()

  let closed: ExtraServer

  beforeAll(async () => {
    closed = await startExtraServer(3911, { NUXT_ALLOW_REGISTRATION: 'false' })
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(() => {
    closed.stop()
  })

  let ip = 0

  function register(body: object) {
    ip += 1
    return closed.request<{ accessToken: string }>('/api/auth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': `10.42.${Math.floor(ip / 250)}.${ip % 250}` },
      body: { name: 'Guest', email: `guest${ip}-${Date.now()}@test.local`, password: 'password123', ...body }
    })
  }

  async function inviteFrom(owner: Awaited<ReturnType<typeof registerUser>>) {
    return $fetch<{ token: string }>('/api/household/invite', { method: 'POST', headers: authHeaders(owner.token) })
  }

  it('lets the very first account in, so a fresh server can get its owner', async () => {
    expect(await closed.request('/api/auth/instance')).toMatchObject({ registration: true })
    await expect(register({})).resolves.toMatchObject({ accessToken: expect.any(String) })
    expect(await closed.request('/api/auth/instance')).toMatchObject({ registration: false })
  })

  it('says registration is closed and refuses a sign-up without an invite', async () => {
    await registerUser()

    expect(await closed.request('/api/auth/instance')).toMatchObject({ registration: false })
    await expect(register({})).rejects.toMatchObject({ statusCode: 403 })
    await expect(register({ inviteToken: 'nope' })).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lets a person with a valid invite sign up and join the family', async () => {
    const owner = await registerUser()
    const { token } = await inviteFrom(owner)

    const guest = await register({ inviteToken: token })
    await $fetch('/api/household/join', { method: 'POST', headers: authHeaders(guest.accessToken), body: { token } })

    const household = await $fetch<{ members: unknown[] }>('/api/household', { headers: authHeaders(owner.token) })
    expect(household.members).toHaveLength(2)
  })

  it('closes the door again once the invite is used', async () => {
    const owner = await registerUser()
    const { token } = await inviteFrom(owner)
    const guest = await register({ inviteToken: token })
    await $fetch('/api/household/join', { method: 'POST', headers: authHeaders(guest.accessToken), body: { token } })

    await expect(register({ inviteToken: token })).rejects.toMatchObject({ statusCode: 403 })
  })

  it('keeps registration open by default and shows no demo', async () => {
    expect(await $fetch('/api/auth/instance')).toEqual({ registration: true, demo: null })
  })
})
