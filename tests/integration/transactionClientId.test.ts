import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb, setupApi } from './helpers'

interface TransactionDto {
  id: string
  amount: number
  categoryId: string
  tagIds: string[]
}

interface CategoryDto {
  id: string
  key: string | null
  type: 'INCOME' | 'EXPENSE'
}

type User = Awaited<ReturnType<typeof registerUser>>

describe('клиентский id транзакции — повтор офлайн-записи не задваивает', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  async function categoryId(user: User, key = 'food') {
    const categories = await $fetch<CategoryDto[]>('/api/categories', { headers: authHeaders(user.token) })
    return categories.find(category => category.key === key)!.id
  }

  async function spend(user: User, id?: string, extra: { categoryId?: string } = {}) {
    return send<TransactionDto>(user, '/api/finance/transactions', 'POST', {
      ...(id && { id }),
      type: 'EXPENSE',
      amount: 350,
      date: '2026-10-14',
      categoryId: extra.categoryId ?? await categoryId(user)
    })
  }

  const rows = (userId: string) => prisma.transaction.count({ where: { userId } })

  const clientId = (char: string) => char.repeat(32)

  it('создаёт транзакцию с id, который прислал клиент', async () => {
    const user = await registerUser()

    const created = await spend(user, clientId('a'))

    expect(created.id).toBe(clientId('a'))
    expect(await rows(user.userId)).toBe(1)
  })

  it('повтор с тем же id отдаёт ту же транзакцию и не создаёт вторую', async () => {
    const user = await registerUser()

    const first = await spend(user, clientId('a'))
    const second = await spend(user, clientId('a'))

    expect(second).toEqual(first)
    expect(await rows(user.userId)).toBe(1)
  })

  it('одновременные повторы (вкладка + service worker) создают одну строку', async () => {
    const user = await registerUser()
    const category = await categoryId(user)
    const body = { id: clientId('a'), type: 'EXPENSE', amount: 350, categoryId: category, date: '2026-10-14' }

    const results = await Promise.all(Array.from({ length: 5 }, () =>
      send<TransactionDto>(user, '/api/finance/transactions', 'POST', body)))

    expect(new Set(results.map(result => result.id))).toEqual(new Set([clientId('a')]))
    expect(await rows(user.userId)).toBe(1)
  })

  it('повтор после удаления категории отдаёт уже созданную, а не 400', async () => {
    const user = await registerUser()
    const created = await spend(user, clientId('a'))
    await send(user, `/api/categories/${created.categoryId}`, 'DELETE')

    const replay = await spend(user, clientId('a'), { categoryId: created.categoryId })

    expect(replay.id).toBe(clientId('a'))
    expect(await rows(user.userId)).toBe(1)
  })

  it('повтор после удаления в корзину не воскрешает и не дублирует запись', async () => {
    const user = await registerUser()
    await spend(user, clientId('a'))
    await send(user, `/api/finance/transactions/${clientId('a')}`, 'DELETE')

    await spend(user, clientId('a'))

    const stored = await prisma.transaction.findMany({ where: { userId: user.userId } })
    expect(stored).toHaveLength(1)
    expect(stored[0]!.deletedAt).not.toBeNull()
  })

  it('id чужой транзакции — 409, чужую запись не отдаёт и не трогает', async () => {
    const owner = await registerUser()
    const stranger = await registerUser()
    await spend(owner, clientId('a'))

    const error = await spend(stranger, clientId('a')).catch(cause => cause)

    expect(error.statusCode).toBe(409)
    expect(await rows(stranger.userId)).toBe(0)
    expect(await prisma.transaction.findUniqueOrThrow({ where: { id: clientId('a') } })).toMatchObject({ userId: owner.userId })
  })

  it('id операции партнёра по семье — тоже 409: повтор относится только к своим записям', async () => {
    const owner = await registerUser()
    const member = await registerUser()
    const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
    await send(member, '/api/household/join', 'POST', { token })
    await spend(owner, clientId('a'))

    const error = await spend(member, clientId('a')).catch(cause => cause)

    expect(error.statusCode).toBe(409)
    expect(await rows(member.userId)).toBe(0)
  })

  it('id неподходящего формата — 400', async () => {
    const user = await registerUser()

    const error = await spend(user, 'Not/A-valid-ID').catch(cause => cause)

    expect(error.statusCode).toBe(400)
    expect(await rows(user.userId)).toBe(0)
  })

  it('без id работает как раньше — для старых закэшированных клиентов', async () => {
    const user = await registerUser()

    const first = await spend(user)
    const second = await spend(user)

    expect(first.id).not.toBe(second.id)
    expect(await rows(user.userId)).toBe(2)
  })

  it('отказ валидации не занимает id — исправленный повтор проходит', async () => {
    const user = await registerUser()
    const income = await categoryId(user, 'salary')

    const error = await spend(user, clientId('a'), { categoryId: income }).catch(cause => cause)
    expect(error.statusCode).toBe(400)

    const created = await spend(user, clientId('a'))

    expect(created.id).toBe(clientId('a'))
  })

  it('через PATCH id не меняется, даже если его прислали', async () => {
    const user = await registerUser()
    await spend(user, clientId('a'))

    const updated = await send<TransactionDto>(user, `/api/finance/transactions/${clientId('a')}`, 'PATCH', { id: clientId('b'), amount: 500 })

    expect(updated.id).toBe(clientId('a'))
    expect(updated.amount).toBe(500)
    expect(await prisma.transaction.count({ where: { id: clientId('b') } })).toBe(0)
  })
})
