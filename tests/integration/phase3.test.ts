import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb } from './helpers'

interface TaskDto {
  id: string
  title: string
  done: boolean
  doneAt: string | null
  tags: Array<{ id: string, name: string }>
}

describe('phase 3 api', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  function createTask(token: string, title = 'Write the report') {
    return $fetch<TaskDto>('/api/tasks', {
      method: 'POST',
      headers: authHeaders(token),
      body: { title }
    })
  }

  function listTasks(token: string, query: object = {}) {
    return $fetch<TaskDto[]>('/api/tasks', { headers: authHeaders(token), query })
  }

  function patchTask(token: string, id: string, body: object) {
    return $fetch<TaskDto>(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body
    })
  }

  describe('done toggle', () => {
    it('moves a task into the done list, not just stamps doneAt', async () => {
      const { token } = await registerUser()
      const created = await createTask(token)

      const updated = await patchTask(token, created.id, { done: true })

      expect(updated.done).toBe(true)
      expect(updated.doneAt).not.toBeNull()
      expect((await listTasks(token, { filter: 'done' })).map(el => el.id)).toEqual([created.id])
      expect(await listTasks(token, { filter: 'open' })).toHaveLength(0)
    })

    it('unchecking returns the task to the open list and clears doneAt', async () => {
      const { token } = await registerUser()
      const created = await createTask(token)
      await patchTask(token, created.id, { done: true })

      const reopened = await patchTask(token, created.id, { done: false })

      expect(reopened.done).toBe(false)
      expect(reopened.doneAt).toBeNull()
      expect((await listTasks(token, { filter: 'open' })).map(el => el.id)).toEqual([created.id])
    })
  })

  describe('list filters', () => {
    it('returns every task without a filter', async () => {
      const { token } = await registerUser()
      const first = await createTask(token, 'Pay the rent')
      const second = await createTask(token, 'Call the clinic')
      await patchTask(token, first.id, { done: true })

      expect(await listTasks(token)).toHaveLength(2)
      expect((await listTasks(token, { filter: 'all' })).map(el => el.id).sort())
        .toEqual([first.id, second.id].sort())
    })

    it('searches by title ignoring case', async () => {
      const { token } = await registerUser()
      await createTask(token, 'Renew the PASSPORT')
      await createTask(token, 'Buy milk')

      const found = await listTasks(token, { search: 'passport' })

      expect(found).toHaveLength(1)
      expect(found[0]!.title).toBe('Renew the PASSPORT')
    })

    it('never leaks tasks of another user', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      await createTask(owner.token)

      expect(await listTasks(stranger.token)).toHaveLength(0)
    })
  })

  describe('due date', () => {
    it('stores a calendar day, not a UTC instant', async () => {
      const { token } = await registerUser()

      const created = await $fetch<TaskDto & { dueDate: string }>('/api/tasks', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Renew the passport', dueDate: '2026-09-20' }
      })

      expect(created.dueDate).toBe('2026-09-20T00:00:00.000Z')
    })

    it('rejects a full ISO datetime with 400', async () => {
      const { token } = await registerUser()

      await expect($fetch('/api/tasks', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Renew the passport', dueDate: '2026-09-20T21:00:00.000Z' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('clears the deadline when dueDate comes as null', async () => {
      const { token } = await registerUser()
      const created = await $fetch<TaskDto>('/api/tasks', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Renew the passport', dueDate: '2026-09-20' }
      })

      const cleared = await patchTask(token, created.id, { dueDate: null })

      expect(cleared).toMatchObject({ dueDate: null })
    })
  })

  describe('tags', () => {
    it('rejects a task with a tag of another user', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const tag = await prisma.tag.create({ data: { userId: stranger.userId, name: 'private' } })

      await expect($fetch('/api/tasks', {
        method: 'POST',
        headers: authHeaders(owner.token),
        body: { title: 'Steal a tag', tagIds: [tag.id] }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns own tags flattened on the task', async () => {
      const { token, userId } = await registerUser()
      const tag = await prisma.tag.create({ data: { userId, name: 'home' } })

      const created = await $fetch<TaskDto>('/api/tasks', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Water the plants', tagIds: [tag.id] }
      })

      expect(created.tags.map(el => el.name)).toEqual(['home'])
    })
  })
})
