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
})
