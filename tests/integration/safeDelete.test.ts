import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb } from './helpers'

interface TagDto {
  id: string
  name: string
}

interface TaskDto {
  id: string
  tags: TagDto[]
}

interface TemplateDto {
  id: string
  tags: TagDto[]
}

describe('safe delete api', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  function createTag(token: string, name: string) {
    return $fetch<TagDto>('/api/tags', { method: 'POST', headers: authHeaders(token), body: { name } })
  }

  function deleteTag(token: string, id: string) {
    return $fetch(`/api/tags/${id}`, { method: 'DELETE', headers: authHeaders(token) })
  }

  describe('tags', () => {
    it('removes the tag from tasks and templates but keeps them', async () => {
      const { token } = await registerUser()
      const work = await createTag(token, 'work')
      const home = await createTag(token, 'home')
      const task = await $fetch<TaskDto>('/api/tasks', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Report', tagIds: [work.id, home.id] }
      })
      const template = await $fetch<TemplateDto>('/api/templates', {
        method: 'POST',
        headers: authHeaders(token),
        body: { title: 'Weekly report', tagIds: [work.id] }
      })

      await deleteTag(token, work.id)

      const tasks = await $fetch<TaskDto[]>('/api/tasks', { headers: authHeaders(token) })
      const templates = await $fetch<TemplateDto[]>('/api/templates', { headers: authHeaders(token) })
      const tags = await $fetch<TagDto[]>('/api/tags', { headers: authHeaders(token) })

      expect(tasks.find(el => el.id === task.id)!.tags.map(el => el.name)).toEqual(['home'])
      expect(templates.find(el => el.id === template.id)!.tags).toEqual([])
      expect(tags.map(el => el.name)).toEqual(['home'])
    })

    it('lets the user create a tag with the same name again', async () => {
      const { token } = await registerUser()
      const work = await createTag(token, 'work')

      await deleteTag(token, work.id)

      await expect(createTag(token, 'work')).resolves.toMatchObject({ name: 'work' })
    })

    it('returns 404 for a tag of another user and leaves it intact', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const tag = await createTag(owner.token, 'private')

      await expect(deleteTag(stranger.token, tag.id)).rejects.toMatchObject({ statusCode: 404 })

      expect(await prisma.tag.findUnique({ where: { id: tag.id } })).not.toBeNull()
    })

    it('returns 404 for a tag that is already gone', async () => {
      const { token } = await registerUser()
      const tag = await createTag(token, 'once')

      await deleteTag(token, tag.id)

      await expect(deleteTag(token, tag.id)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('rejects an anonymous request', async () => {
      const { token } = await registerUser()
      const tag = await createTag(token, 'work')

      await expect($fetch(`/api/tags/${tag.id}`, { method: 'DELETE' })).rejects.toMatchObject({ statusCode: 401 })
    })
  })
})
