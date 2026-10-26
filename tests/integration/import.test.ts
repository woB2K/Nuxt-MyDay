import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

type User = Awaited<ReturnType<typeof registerUser>>

interface CategoryDto { id: string, name: string, key: string | null, type: 'INCOME' | 'EXPENSE' }
interface TransactionDto { id: string, amount: number, categoryId: string, tagIds: string[], notes: string | null, date: string, userId: string }

describe('transaction import', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const get = <T>(user: User, url: string) => $fetch<T>(url, { headers: authHeaders(user.token) })
  const importRows = (user: User, rows: object[]) =>
    $fetch<{ created: number, existing: number, categories: number, tags: number }>('/api/finance/import', { method: 'POST', headers: authHeaders(user.token), body: { rows } })
  const transactions = async (user: User) =>
    (await $fetch<{ data: TransactionDto[] }>('/api/finance/transactions', { headers: authHeaders(user.token), query: { limit: 100 } })).data

  const row = (fingerprint: string, extra: object = {}) => ({ fingerprint, type: 'EXPENSE', amount: 150, date: '2026-10-01', categoryName: 'Кафе', ...extra })

  it('creates transactions, new categories and tags, and maps names to existing ones case-insensitively', async () => {
    const user = await registerUser()
    const food = (await get<CategoryDto[]>(user, '/api/categories')).find(category => category.key === 'food')!

    const result = await importRows(user, [
      row('a', { tags: ['обед', 'Работа'] }),
      row('b', { categoryName: 'кафе', amount: 99.9, tags: ['работа'] }),
      row('c', { categoryId: food.id, categoryName: undefined, notes: 'Пятёрочка' })
    ])

    expect(result).toEqual({ created: 3, existing: 0, categories: 1, tags: 2 })

    const list = await transactions(user)
    const cafe = (await get<CategoryDto[]>(user, '/api/categories')).filter(category => category.name.toLowerCase() === 'кафе')
    expect(cafe).toHaveLength(1)
    expect(list.filter(item => item.categoryId === cafe[0]!.id).map(item => item.amount).sort()).toEqual([150, 99.9])
    expect(list.find(item => item.notes === 'Пятёрочка')).toMatchObject({ categoryId: food.id, userId: user.userId })
    expect(await get<unknown[]>(user, '/api/finance/tags')).toHaveLength(2)
  })

  it('does not duplicate anything when the same file is imported again', async () => {
    const user = await registerUser()
    await importRows(user, [row('a'), row('b')])

    expect(await importRows(user, [row('a'), row('b'), row('c')])).toEqual({ created: 1, existing: 2, categories: 0, tags: 0 })
    expect(await transactions(user)).toHaveLength(3)
  })

  it('keeps a deleted imported transaction deleted on re-import', async () => {
    const user = await registerUser()
    await importRows(user, [row('a')])
    const [created] = await transactions(user)
    await $fetch(`/api/finance/transactions/${created!.id}`, { method: 'DELETE', headers: authHeaders(user.token) })

    expect(await importRows(user, [row('a')])).toMatchObject({ created: 0, existing: 1 })
    expect(await transactions(user)).toHaveLength(0)
  })

  it('gives two families importing the same file their own copies', async () => {
    const anna = await registerUser()
    const boris = await registerUser()

    await importRows(anna, [row('a')])

    expect(await importRows(boris, [row('a')])).toMatchObject({ created: 1, existing: 0 })
    expect(await transactions(anna)).toHaveLength(1)
    expect(await transactions(boris)).toHaveLength(1)
  })

  it('does not duplicate a file imported before joining a family when it is imported again after', async () => {
    const anna = await registerUser()
    const boris = await registerUser()
    await importRows(boris, [row('a'), row('b')])

    const { token } = await $fetch<{ token: string }>('/api/household/invite', { method: 'POST', headers: authHeaders(anna.token) })
    await $fetch('/api/household/join', { method: 'POST', headers: authHeaders(boris.token), body: { token } })

    expect(await importRows(boris, [row('a'), row('b')])).toMatchObject({ created: 0, existing: 2 })
    expect(await importRows(anna, [row('a')])).toMatchObject({ created: 0, existing: 1 })
    expect(await transactions(anna)).toHaveLength(2)
  })

  it('refuses a category of another family, a type mismatch and malformed rows', async () => {
    const anna = await registerUser()
    const boris = await registerUser()
    const borisFood = (await get<CategoryDto[]>(boris, '/api/categories')).find(category => category.key === 'food')!
    const annaSalary = (await get<CategoryDto[]>(anna, '/api/categories')).find(category => category.type === 'INCOME')!

    await expect(importRows(anna, [row('a', { categoryId: borisFood.id, categoryName: undefined })])).rejects.toMatchObject({ statusCode: 400 })
    await expect(importRows(anna, [row('a', { categoryId: annaSalary.id, categoryName: undefined })])).rejects.toMatchObject({ statusCode: 400 })
    await expect(importRows(anna, [row('a', { amount: -5 })])).rejects.toMatchObject({ statusCode: 400 })
    await expect(importRows(anna, [row('a', { categoryId: annaSalary.id })])).rejects.toMatchObject({ statusCode: 400 })
    await expect(importRows(anna, [])).rejects.toMatchObject({ statusCode: 400 })
    expect(await transactions(anna)).toHaveLength(0)
  })
})
