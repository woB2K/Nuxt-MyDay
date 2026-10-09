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

interface TransactionDto {
  id: string
  amount: number
  categoryId: string
}

interface SavingsDto {
  id: string
  amount: number
  type: 'OPENING' | 'DEPOSIT' | 'WITHDRAWAL'
}

interface SavingsResponseDto {
  balance: number
  delta: number
  opening: number | null
  entries: SavingsDto[]
  total: number
}

interface TrashDto {
  tasks: TaskDto[]
  transactions: TransactionDto[]
  savings: SavingsDto[]
}

const DAY_MS = 24 * 60 * 60 * 1000

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

  function del(token: string, url: string) {
    return $fetch(url, { method: 'DELETE', headers: authHeaders(token) })
  }

  function restore<T>(token: string, url: string) {
    return $fetch<T>(`${url}/restore`, { method: 'POST', headers: authHeaders(token) })
  }

  function getTrash(token: string) {
    return $fetch<TrashDto>('/api/trash', { headers: authHeaders(token) })
  }

  function createTask(token: string, body: object = { title: 'Report' }) {
    return $fetch<TaskDto>('/api/tasks', { method: 'POST', headers: authHeaders(token), body })
  }

  function listTasks(token: string, query: object = {}) {
    return $fetch<TaskDto[]>('/api/tasks', { headers: authHeaders(token), query })
  }

  async function categoryId(token: string, type: 'INCOME' | 'EXPENSE') {
    const categories = await $fetch<Array<{ id: string, type: string, isSystem: boolean }>>('/api/categories', { headers: authHeaders(token) })
    return categories.find(el => el.type === type && !el.isSystem)!.id
  }

  async function createTransaction(token: string, amount: number, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') {
    return $fetch<TransactionDto>('/api/finance/transactions', {
      method: 'POST',
      headers: authHeaders(token),
      body: { type, amount, categoryId: await categoryId(token, type), date: '2026-10-05' }
    })
  }

  function listTransactions(token: string) {
    return $fetch<{ data: TransactionDto[], total: number }>('/api/finance/transactions', { headers: authHeaders(token) })
  }

  function summary(token: string) {
    return $fetch<{ income: number, expense: number, breakdown: Array<{ total: number }> }>('/api/finance/summary', { headers: authHeaders(token) })
  }

  function createSavings(token: string, amount: number, type: SavingsDto['type'] = 'DEPOSIT') {
    return $fetch<SavingsDto>('/api/finance/savings', { method: 'POST', headers: authHeaders(token), body: { amount, type } })
  }

  function savings(token: string) {
    return $fetch<SavingsResponseDto>('/api/finance/savings', { headers: authHeaders(token) })
  }

  function ageInTrash(model: 'task' | 'transaction' | 'savingsEntry', id: string, days: number) {
    const deletedAt = new Date(Date.now() - days * DAY_MS)
    const args = { where: { id }, data: { deletedAt } }
    if (model === 'task') return prisma.task.update(args)
    if (model === 'transaction') return prisma.transaction.update(args)
    return prisma.savingsEntry.update(args)
  }

  describe('tasks', () => {
    it('hides a deleted task from every filter and search but keeps the row', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)

      await del(token, `/api/tasks/${task.id}`)

      expect(await listTasks(token)).toEqual([])
      expect(await listTasks(token, { filter: 'open' })).toEqual([])
      expect(await listTasks(token, { search: 'Report' })).toEqual([])
      expect((await prisma.task.findUnique({ where: { id: task.id } }))?.deletedAt).not.toBeNull()
    })

    it('hides a deleted done task from the done list', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)
      await $fetch(`/api/tasks/${task.id}`, { method: 'PATCH', headers: authHeaders(token), body: { done: true } })

      await del(token, `/api/tasks/${task.id}`)

      expect(await listTasks(token, { filter: 'done' })).toEqual([])
    })

    it('returns 404 when deleting the same task twice', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)

      await del(token, `/api/tasks/${task.id}`)

      await expect(del(token, `/api/tasks/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('does not let a deleted task be edited', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)
      await del(token, `/api/tasks/${task.id}`)

      await expect($fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { title: 'Changed' }
      })).rejects.toMatchObject({ statusCode: 404 })
    })

    it('restores a task back into the list with its tags', async () => {
      const { token } = await registerUser()
      const tag = await createTag(token, 'work')
      const task = await createTask(token, { title: 'Report', tagIds: [tag.id] })
      await del(token, `/api/tasks/${task.id}`)

      const restored = await restore<TaskDto>(token, `/api/tasks/${task.id}`)

      expect(restored.tags.map(el => el.name)).toEqual(['work'])
      expect((await listTasks(token)).map(el => el.id)).toEqual([task.id])
      expect((await getTrash(token)).tasks).toEqual([])
    })

    it('returns 404 when restoring a task that is not deleted', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)

      await expect(restore(token, `/api/tasks/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('does not let another user delete or restore a task', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const task = await createTask(owner.token)

      await expect(del(stranger.token, `/api/tasks/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
      await del(owner.token, `/api/tasks/${task.id}`)
      await expect(restore(stranger.token, `/api/tasks/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })

      expect((await getTrash(owner.token)).tasks).toHaveLength(1)
    })
  })

  describe('transactions', () => {
    it('excludes a deleted transaction from the list, the total and the summary', async () => {
      const { token } = await registerUser()
      const kept = await createTransaction(token, 100)
      const removed = await createTransaction(token, 250)
      await createTransaction(token, 1000, 'INCOME')

      await del(token, `/api/finance/transactions/${removed.id}`)

      const list = await listTransactions(token)
      const totals = await summary(token)
      expect(list.data.map(el => el.id)).not.toContain(removed.id)
      expect(list.data.map(el => el.id)).toContain(kept.id)
      expect(list.total).toBe(2)
      expect(totals.expense).toBe(100)
      expect(totals.income).toBe(1000)
      expect(totals.breakdown.map(el => el.total)).toEqual([100])
    })

    it('does not let a deleted transaction be edited or deleted again', async () => {
      const { token } = await registerUser()
      const tx = await createTransaction(token, 100)
      await del(token, `/api/finance/transactions/${tx.id}`)

      await expect($fetch(`/api/finance/transactions/${tx.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { amount: 5 }
      })).rejects.toMatchObject({ statusCode: 404 })
      await expect(del(token, `/api/finance/transactions/${tx.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('restores a transaction back into the list and the summary', async () => {
      const { token } = await registerUser()
      const tx = await createTransaction(token, 100)
      await del(token, `/api/finance/transactions/${tx.id}`)

      const restored = await restore<TransactionDto>(token, `/api/finance/transactions/${tx.id}`)

      expect(restored.amount).toBe(100)
      expect((await listTransactions(token)).total).toBe(1)
      expect((await summary(token)).expense).toBe(100)
    })

    it('moves deleted transactions with their category, so a restore lands in the fallback', async () => {
      const { token } = await registerUser()
      const category = await $fetch<{ id: string }>('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: { name: 'Pets', type: 'EXPENSE', icon: 'i-lucide-dog', color: '#FFFFFF' }
      })
      const tx = await $fetch<TransactionDto>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 40, categoryId: category.id, date: '2026-10-05' }
      })
      await del(token, `/api/finance/transactions/${tx.id}`)

      await del(token, `/api/categories/${category.id}`)
      const restored = await restore<TransactionDto>(token, `/api/finance/transactions/${tx.id}`)

      const fallback = await prisma.category.findFirst({ where: { id: restored.categoryId } })
      expect(fallback?.isSystem).toBe(true)
    })

    it('does not let another user restore a transaction', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const tx = await createTransaction(owner.token, 100)
      await del(owner.token, `/api/finance/transactions/${tx.id}`)

      await expect(restore(stranger.token, `/api/finance/transactions/${tx.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('savings', () => {
    it('excludes a deleted entry from balance, delta and the history', async () => {
      const { token } = await registerUser()
      await createSavings(token, 1000, 'OPENING')
      await createSavings(token, 300)
      const removed = await createSavings(token, 200)

      await del(token, `/api/finance/savings/${removed.id}`)

      const result = await savings(token)
      expect(result.balance).toBe(1300)
      expect(result.delta).toBe(300)
      expect(result.total).toBe(2)
      expect(result.entries.map(el => el.id)).not.toContain(removed.id)
    })

    it('excludes a deleted entry from the delta of a period', async () => {
      const { token } = await registerUser()
      await createSavings(token, 300)
      const removed = await createSavings(token, 200, 'WITHDRAWAL')
      await del(token, `/api/finance/savings/${removed.id}`)

      const today = new Date().toISOString().slice(0, 10)
      const result = await $fetch<SavingsResponseDto>('/api/finance/savings', {
        headers: authHeaders(token),
        query: { from: today, to: today }
      })

      expect(result.delta).toBe(300)
      expect(result.total).toBe(1)
    })

    it('does not let a deleted entry be edited', async () => {
      const { token } = await registerUser()
      const entry = await createSavings(token, 300)
      await del(token, `/api/finance/savings/${entry.id}`)

      await expect($fetch(`/api/finance/savings/${entry.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { amount: 5 }
      })).rejects.toMatchObject({ statusCode: 404 })
    })

    it('restores an entry back into the balance', async () => {
      const { token } = await registerUser()
      const entry = await createSavings(token, 300)
      await del(token, `/api/finance/savings/${entry.id}`)

      await restore(token, `/api/finance/savings/${entry.id}`)

      expect((await savings(token)).balance).toBe(300)
    })

    it('allows a new opening balance once the old one is deleted', async () => {
      const { token } = await registerUser()
      const opening = await createSavings(token, 1000, 'OPENING')

      await del(token, `/api/finance/savings/${opening.id}`)

      await expect(createSavings(token, 500, 'OPENING')).resolves.toMatchObject({ amount: 500 })
      expect((await savings(token)).opening).toBe(500)
    })

    it('refuses to restore an opening balance while another one is active', async () => {
      const { token } = await registerUser()
      const opening = await createSavings(token, 1000, 'OPENING')
      await del(token, `/api/finance/savings/${opening.id}`)
      await createSavings(token, 500, 'OPENING')

      await expect(restore(token, `/api/finance/savings/${opening.id}`)).rejects.toMatchObject({ statusCode: 409 })
      expect((await getTrash(token)).savings.map(el => el.id)).toEqual([opening.id])
    })

    it('restores an opening balance when no other one is active', async () => {
      const { token } = await registerUser()
      const opening = await createSavings(token, 1000, 'OPENING')
      await del(token, `/api/finance/savings/${opening.id}`)

      await restore(token, `/api/finance/savings/${opening.id}`)

      expect((await savings(token)).opening).toBe(1000)
    })

    it('does not let another user restore an entry', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const entry = await createSavings(owner.token, 300)
      await del(owner.token, `/api/finance/savings/${entry.id}`)

      await expect(restore(stranger.token, `/api/finance/savings/${entry.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('trash', () => {
    it('lists deleted items of every kind, newest first, without live ones', async () => {
      const { token } = await registerUser()
      const first = await createTask(token, { title: 'First' })
      const second = await createTask(token, { title: 'Second' })
      await createTask(token, { title: 'Alive' })
      const tx = await createTransaction(token, 100)
      const entry = await createSavings(token, 300)

      await del(token, `/api/tasks/${first.id}`)
      await del(token, `/api/tasks/${second.id}`)
      await del(token, `/api/finance/transactions/${tx.id}`)
      await del(token, `/api/finance/savings/${entry.id}`)

      const trash = await getTrash(token)
      expect(trash.tasks.map(el => el.id)).toEqual([second.id, first.id])
      expect(trash.transactions).toMatchObject([{ id: tx.id, amount: 100 }])
      expect(trash.savings).toMatchObject([{ id: entry.id, amount: 300 }])
    })

    it('does not show another user\'s trash', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const task = await createTask(owner.token)
      await del(owner.token, `/api/tasks/${task.id}`)

      expect(await getTrash(stranger.token)).toEqual({ tasks: [], transactions: [], savings: [] })
    })

    it('purges items older than 30 days and keeps younger ones', async () => {
      const { token } = await registerUser()
      const old = await createTask(token, { title: 'Old' })
      const recent = await createTask(token, { title: 'Recent' })
      const oldTx = await createTransaction(token, 100)
      const oldEntry = await createSavings(token, 300)
      await Promise.all([old, recent].map(el => del(token, `/api/tasks/${el.id}`)))
      await del(token, `/api/finance/transactions/${oldTx.id}`)
      await del(token, `/api/finance/savings/${oldEntry.id}`)
      await ageInTrash('task', old.id, 31)
      await ageInTrash('task', recent.id, 29)
      await ageInTrash('transaction', oldTx.id, 31)
      await ageInTrash('savingsEntry', oldEntry.id, 31)

      const trash = await getTrash(token)

      expect(trash.tasks.map(el => el.id)).toEqual([recent.id])
      expect(trash.transactions).toEqual([])
      expect(trash.savings).toEqual([])
      expect(await prisma.task.findUnique({ where: { id: old.id } })).toBeNull()
      expect(await prisma.transaction.findUnique({ where: { id: oldTx.id } })).toBeNull()
      expect(await prisma.savingsEntry.findUnique({ where: { id: oldEntry.id } })).toBeNull()
    })

    it('does not purge another user\'s expired items', async () => {
      const owner = await registerUser()
      const other = await registerUser()
      const task = await createTask(other.token)
      await del(other.token, `/api/tasks/${task.id}`)
      await ageInTrash('task', task.id, 31)

      await getTrash(owner.token)

      expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull()
    })

    it('refuses to restore an item that expired but is not purged yet', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)
      await del(token, `/api/tasks/${task.id}`)
      await ageInTrash('task', task.id, 31)

      await expect(restore(token, `/api/tasks/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('deletes one item forever', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)
      const tx = await createTransaction(token, 100)
      const entry = await createSavings(token, 300)
      await del(token, `/api/tasks/${task.id}`)
      await del(token, `/api/finance/transactions/${tx.id}`)
      await del(token, `/api/finance/savings/${entry.id}`)

      await del(token, `/api/trash/task/${task.id}`)
      await del(token, `/api/trash/transaction/${tx.id}`)
      await del(token, `/api/trash/savings/${entry.id}`)

      expect(await getTrash(token)).toEqual({ tasks: [], transactions: [], savings: [] })
      expect(await prisma.task.findUnique({ where: { id: task.id } })).toBeNull()
      expect(await prisma.transaction.findUnique({ where: { id: tx.id } })).toBeNull()
      expect(await prisma.savingsEntry.findUnique({ where: { id: entry.id } })).toBeNull()
    })

    it('refuses to delete forever an item that is not in the trash', async () => {
      const { token } = await registerUser()
      const task = await createTask(token)

      await expect(del(token, `/api/trash/task/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
      expect(await listTasks(token)).toHaveLength(1)
    })

    it('refuses to delete forever an item of another user', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const task = await createTask(owner.token)
      await del(owner.token, `/api/tasks/${task.id}`)

      await expect(del(stranger.token, `/api/trash/task/${task.id}`)).rejects.toMatchObject({ statusCode: 404 })
      expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull()
    })

    it('rejects an unknown kind', async () => {
      const { token } = await registerUser()

      await expect(del(token, '/api/trash/budget/whatever')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('empties only the caller\'s trash and leaves live items alone', async () => {
      const owner = await registerUser()
      const other = await registerUser()
      const removed = await createTask(owner.token, { title: 'Removed' })
      const alive = await createTask(owner.token, { title: 'Alive' })
      const tx = await createTransaction(owner.token, 100)
      const entry = await createSavings(owner.token, 300)
      const othersTask = await createTask(other.token)
      await del(owner.token, `/api/tasks/${removed.id}`)
      await del(owner.token, `/api/finance/transactions/${tx.id}`)
      await del(owner.token, `/api/finance/savings/${entry.id}`)
      await del(other.token, `/api/tasks/${othersTask.id}`)

      const result = await $fetch<{ deleted: number }>('/api/trash', { method: 'DELETE', headers: authHeaders(owner.token) })

      expect(result.deleted).toBe(3)
      expect(await getTrash(owner.token)).toEqual({ tasks: [], transactions: [], savings: [] })
      expect((await listTasks(owner.token)).map(el => el.id)).toEqual([alive.id])
      expect((await getTrash(other.token)).tasks).toHaveLength(1)
    })

    it('rejects anonymous requests', async () => {
      await expect($fetch('/api/trash')).rejects.toMatchObject({ statusCode: 401 })
      await expect($fetch('/api/trash', { method: 'DELETE' })).rejects.toMatchObject({ statusCode: 401 })
    })
  })

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
