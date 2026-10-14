import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

interface TagDto {
  id: string
  name: string
}

interface TransactionDto {
  id: string
  tagIds: string[]
}

interface CategoryDto {
  id: string
  key: string | null
}

type User = Awaited<ReturnType<typeof registerUser>>

describe('finance tags api', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const get = <T>(user: User, url: string, query: object = {}) =>
    $fetch<T>(url, { headers: authHeaders(user.token), query })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  const tags = (user: User) => get<TagDto[]>(user, '/api/finance/tags')
  const addTag = (user: User, name: string) => send<TagDto>(user, '/api/finance/tags', 'POST', { name })
  const transactions = async (user: User, query: object = {}) =>
    (await get<{ data: TransactionDto[] }>(user, '/api/finance/transactions', query)).data

  async function food(user: User) {
    return (await get<CategoryDto[]>(user, '/api/categories')).find(category => category.key === 'food')!.id
  }

  async function spend(user: User, amount: number, tagIds?: string[]) {
    return send<TransactionDto>(user, '/api/finance/transactions', 'POST', {
      type: 'EXPENSE',
      amount,
      categoryId: await food(user),
      date: '2026-10-01',
      tagIds
    })
  }

  async function family() {
    const owner = await registerUser()
    const member = await registerUser()
    const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
    await send(member, '/api/household/join', 'POST', { token })
    return { owner, member }
  }

  describe('crud', () => {
    it('creates, renames and deletes a tag, sorted by name', async () => {
      const user = await registerUser()
      const trip = await addTag(user, 'Отпуск')
      await addTag(user, 'Кафе')

      expect((await tags(user)).map(tag => tag.name)).toEqual(['Кафе', 'Отпуск'])

      await send(user, `/api/finance/tags/${trip.id}`, 'PATCH', { name: 'Поездка' })
      expect((await tags(user)).map(tag => tag.name)).toEqual(['Кафе', 'Поездка'])

      await send(user, `/api/finance/tags/${trip.id}`, 'DELETE')
      expect((await tags(user)).map(tag => tag.name)).toEqual(['Кафе'])
    })

    it('answers 409 to a duplicate name and trims it first', async () => {
      const user = await registerUser()
      await addTag(user, 'Кафе')

      await expect(addTag(user, '  Кафе ')).rejects.toMatchObject({ statusCode: 409 })
    })

    it('keeps other families out of the tags', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const tag = await addTag(owner, 'Кафе')

      expect(await tags(stranger)).toEqual([])
      await expect(send(stranger, `/api/finance/tags/${tag.id}`, 'PATCH', { name: 'X' })).rejects.toMatchObject({ statusCode: 404 })
      await expect(send(stranger, `/api/finance/tags/${tag.id}`, 'DELETE')).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('tags on transactions', () => {
    it('tags a transaction on create and returns the tag ids', async () => {
      const user = await registerUser()
      const tag = await addTag(user, 'Кафе')

      const created = await spend(user, 10, [tag.id, tag.id])

      expect(created.tagIds).toEqual([tag.id])
      expect((await transactions(user))[0]!.tagIds).toEqual([tag.id])
    })

    it('rejects a tag of another family', async () => {
      const user = await registerUser()
      const stranger = await registerUser()
      const foreign = await addTag(stranger, 'Чужой')

      await expect(spend(user, 10, [foreign.id])).rejects.toMatchObject({ statusCode: 400 })
    })

    it('replaces tags on patch, keeps them when tagIds is absent and clears them with an empty list', async () => {
      const user = await registerUser()
      const cafe = await addTag(user, 'Кафе')
      const trip = await addTag(user, 'Отпуск')
      const created = await spend(user, 10, [cafe.id])
      const url = `/api/finance/transactions/${created.id}`

      expect((await send<TransactionDto>(user, url, 'PATCH', { tagIds: [trip.id] })).tagIds).toEqual([trip.id])
      expect((await send<TransactionDto>(user, url, 'PATCH', { amount: 20 })).tagIds).toEqual([trip.id])
      expect((await send<TransactionDto>(user, url, 'PATCH', { tagIds: [] })).tagIds).toEqual([])
    })

    it('unlinks a deleted tag but keeps the transaction', async () => {
      const user = await registerUser()
      const tag = await addTag(user, 'Кафе')
      await spend(user, 10, [tag.id])

      await send(user, `/api/finance/tags/${tag.id}`, 'DELETE')

      const [transaction] = await transactions(user)
      expect(transaction!.tagIds).toEqual([])
    })

    it('filters the list and the summary by any of the tags', async () => {
      const user = await registerUser()
      const cafe = await addTag(user, 'Кафе')
      const trip = await addTag(user, 'Отпуск')
      await spend(user, 10, [cafe.id])
      await spend(user, 20, [trip.id])
      await spend(user, 40)

      expect(await transactions(user, { tagIds: cafe.id })).toHaveLength(1)
      expect(await transactions(user, { tagIds: `${cafe.id},${trip.id}` })).toHaveLength(2)

      const summary = await get<{ expense: number }>(user, '/api/finance/summary', { tagIds: trip.id })
      expect(summary.expense).toBe(20)
    })
  })

  describe('family', () => {
    it('shares tags with the whole family', async () => {
      const { owner, member } = await family()
      const tag = await addTag(owner, 'Кафе')

      expect((await spend(member, 10, [tag.id])).tagIds).toEqual([tag.id])
    })

    it('glues tags by name when someone joins', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      const familyTrip = await addTag(owner, 'Отпуск')
      const guestTrip = await addTag(guest, 'Отпуск')
      await addTag(guest, 'Кафе')
      await spend(guest, 10, [guestTrip.id])

      const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
      await send(guest, '/api/household/join', 'POST', { token })

      expect((await tags(owner)).map(tag => tag.name)).toEqual(['Кафе', 'Отпуск'])
      expect((await transactions(owner))[0]!.tagIds).toEqual([familyTrip.id])
    })

    it('gives the leaver copies of the tags on their own transactions', async () => {
      const { owner, member } = await family()
      const tag = await addTag(owner, 'Кафе')
      await spend(member, 10, [tag.id])
      await spend(member, 20)

      await send(member, '/api/household/leave', 'POST')

      const [copy] = await tags(member)
      expect(copy).toMatchObject({ name: 'Кафе' })
      expect(copy!.id).not.toBe(tag.id)
      expect((await transactions(member)).map(item => item.tagIds).sort()).toEqual([[], [copy!.id]])
      expect((await transactions(owner)).map(item => item.tagIds).sort()).toEqual([[], [tag.id]])
    })
  })
})
