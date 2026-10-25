import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { $fetch } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

const output = resolve(fileURLToPath(new URL('../..', import.meta.url)), '.nuxt/test/api/output/server/index.mjs')
const PORT = 3911
const closedUrl = `http://127.0.0.1:${PORT}`

async function closed<T>(path: string, init: { method?: string, headers?: Record<string, string>, body?: object } = {}): Promise<T> {
  const response = await fetch(`${closedUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: { 'content-type': 'application/json', ...init.headers },
    body: init.body ? JSON.stringify(init.body) : undefined
  })
  if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { statusCode: response.status })
  return await response.json() as T
}

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await closed('/api/auth/registration')
      return
    } catch {
      await new Promise(done => setTimeout(done, 200))
    }
  }
  throw new Error('Closed-registration server did not start')
}

describe('closed registration', async () => {
  await setupApi()

  let server: ChildProcess

  beforeAll(async () => {
    server = spawn(process.execPath, [output], {
      env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NUXT_ALLOW_REGISTRATION: 'false' },
      stdio: 'ignore'
    })
    await waitForServer()
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(() => {
    server.kill()
  })

  let ip = 0

  function register(body: object) {
    ip += 1
    return closed<{ accessToken: string }>('/api/auth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': `10.42.${Math.floor(ip / 250)}.${ip % 250}` },
      body: { name: 'Guest', email: `guest${ip}-${Date.now()}@test.local`, password: 'password123', ...body }
    })
  }

  async function inviteFrom(owner: Awaited<ReturnType<typeof registerUser>>) {
    return $fetch<{ token: string }>('/api/household/invite', { method: 'POST', headers: authHeaders(owner.token) })
  }

  it('says registration is closed and refuses a sign-up without an invite', async () => {
    expect(await closed('/api/auth/registration')).toEqual({ open: false })
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

  it('closes the door again once the invite is used or expired', async () => {
    const owner = await registerUser()
    const { token } = await inviteFrom(owner)
    const guest = await register({ inviteToken: token })
    await $fetch('/api/household/join', { method: 'POST', headers: authHeaders(guest.accessToken), body: { token } })

    await expect(register({ inviteToken: token })).rejects.toMatchObject({ statusCode: 403 })
  })

  it('keeps registration open by default', async () => {
    expect(await $fetch('/api/auth/registration')).toEqual({ open: true })
  })
})
