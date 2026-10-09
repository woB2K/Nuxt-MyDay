import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, householdOf, prisma, registerUser, resetDb } from './helpers'

interface CategoryDto {
  id: string
  name: string
  key: string | null
  type: 'INCOME' | 'EXPENSE'
}

interface TagDto {
  id: string
  name: string
}

interface TaskDto {
  id: string
  tags: TagDto[]
}

interface TransactionDto {
  id: string
  userId: string
  amount: number
  categoryId: string
}

interface SavingsResponseDto {
  balance: number
  opening: number | null
  entries: Array<{ id: string, userId: string }>
}

interface HouseholdDto {
  id: string
  role: 'OWNER' | 'MEMBER'
  shareSavings: boolean
  members: Array<{ userId: string, name: string, role: 'OWNER' | 'MEMBER' }>
  invite: { expiresAt: string } | null
}

interface InviteDto {
  token: string
  expiresAt: string
}

interface PreviewDto {
  inviterName: string
  memberCount: number
  shareSavings: boolean
  state: 'ready' | 'alreadyMember' | 'mustLeave'
}

type User = Awaited<ReturnType<typeof registerUser>>

describe('household api', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  const get = <T>(user: User, url: string, query: object = {}) =>
    $fetch<T>(url, { headers: authHeaders(user.token), query })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  const household = (user: User) => get<HouseholdDto>(user, '/api/household')
  const invite = (user: User) => send<InviteDto>(user, '/api/household/invite', 'POST')
  const join = (user: User, token: string) => send<HouseholdDto>(user, '/api/household/join', 'POST', { token })
  const leave = (user: User) => send<HouseholdDto>(user, '/api/household/leave', 'POST')
  const categories = (user: User) => get<CategoryDto[]>(user, '/api/categories')
  const tags = (user: User) => get<TagDto[]>(user, '/api/tags')
  const transactions = async (user: User) => (await get<{ data: TransactionDto[] }>(user, '/api/finance/transactions')).data
  const savings = (user: User) => get<SavingsResponseDto>(user, '/api/finance/savings')

  async function byKey(user: User, key: string) {
    return (await categories(user)).find(category => category.key === key)!
  }

  function spend(user: User, categoryId: string, amount: number) {
    return send<TransactionDto>(user, '/api/finance/transactions', 'POST', { type: 'EXPENSE', amount, categoryId, date: '2026-10-01' })
  }

  function deposit(user: User, amount: number, type: 'DEPOSIT' | 'OPENING' = 'DEPOSIT') {
    return send(user, '/api/finance/savings', 'POST', { amount, type })
  }

  async function family() {
    const owner = await registerUser()
    const member = await registerUser()
    const { token } = await invite(owner)
    await join(member, token)
    return { owner, member }
  }

  describe('household of one', () => {
    it('gives every new user a household where they are the owner', async () => {
      const user = await registerUser()

      const result = await household(user)

      expect(result.role).toBe('OWNER')
      expect(result.shareSavings).toBe(true)
      expect(result.members).toEqual([expect.objectContaining({ userId: user.userId, role: 'OWNER' })])
      expect(result.invite).toBeNull()
    })

    it('does not let a user leave a household of one', async () => {
      const user = await registerUser()

      await expect(leave(user)).rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('invites', () => {
    it('shows the inviter and the household to the invitee', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      const { token } = await invite(owner)

      const preview = await get<PreviewDto>(guest, '/api/household/join', { token })

      expect(preview).toEqual({ inviterName: 'Test User', memberCount: 1, shareSavings: true, state: 'ready' })
      expect((await household(owner)).invite).not.toBeNull()
    })

    it('keeps only the latest invite', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      const first = await invite(owner)
      await invite(owner)

      await expect(get(guest, '/api/household/join', { token: first.token })).rejects.toMatchObject({ statusCode: 404 })
    })

    it('rejects an unknown, expired, revoked or used token', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      const other = await registerUser()

      await expect(join(guest, 'nope')).rejects.toMatchObject({ statusCode: 404 })

      const expired = await invite(owner)
      await prisma.householdInvite.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })
      await expect(join(guest, expired.token)).rejects.toMatchObject({ statusCode: 404 })

      const revoked = await invite(owner)
      await send(owner, '/api/household/invite', 'DELETE')
      await expect(join(guest, revoked.token)).rejects.toMatchObject({ statusCode: 404 })

      const used = await invite(owner)
      await join(guest, used.token)
      await expect(join(other, used.token)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('lets only the owner invite, revoke and change settings', async () => {
      const { member } = await family()

      await expect(invite(member)).rejects.toMatchObject({ statusCode: 403 })
      await expect(send(member, '/api/household/invite', 'DELETE')).rejects.toMatchObject({ statusCode: 403 })
      await expect(send(member, '/api/household', 'PATCH', { shareSavings: false })).rejects.toMatchObject({ statusCode: 403 })
    })

    it('refuses to join the own household', async () => {
      const owner = await registerUser()
      const { token } = await invite(owner)

      expect((await get<PreviewDto>(owner, '/api/household/join', { token })).state).toBe('alreadyMember')
      await expect(join(owner, token)).rejects.toMatchObject({ statusCode: 409 })
    })

    it('asks a member of another family to leave it first', async () => {
      const { member } = await family()
      const stranger = await registerUser()
      const { token } = await invite(stranger)

      expect((await get<PreviewDto>(member, '/api/household/join', { token })).state).toBe('mustLeave')
      await expect(join(member, token)).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('joining merges finances', () => {
    it('moves transactions into the family and glues categories by key and name', async () => {
      const owner = await registerUser()
      const guest = await registerUser()

      const ownerFood = await byKey(owner, 'food')
      await spend(owner, ownerFood.id, 100)

      const pets = await send<CategoryDto>(guest, '/api/categories', 'POST', { name: 'Pets', icon: 'i-lucide-dog', color: '#FFFFFF', type: 'EXPENSE' })
      const guestFood = await byKey(guest, 'food')
      await spend(guest, guestFood.id, 30)
      await spend(guest, pets.id, 20)

      const guestHousehold = await householdOf(guest.userId)
      const { token } = await invite(owner)
      const joined = await join(guest, token)

      expect(joined.members.map(member => member.role)).toEqual(['OWNER', 'MEMBER'])
      expect(await prisma.household.findUnique({ where: { id: guestHousehold } })).toBeNull()

      const list = await transactions(owner)
      expect(list).toHaveLength(3)
      expect(list.filter(tx => tx.userId === guest.userId)).toHaveLength(2)
      expect(list.filter(tx => tx.categoryId === ownerFood.id)).toHaveLength(2)

      const merged = await categories(guest)
      expect(merged.filter(category => category.key === 'food')).toHaveLength(1)
      expect(merged.filter(category => category.key === 'other-expense')).toHaveLength(1)
      expect(merged.map(category => category.name)).toContain('Pets')
      expect(await transactions(guest)).toEqual(list)
    })

    it('glues tags by name and keeps them on the newcomer tasks', async () => {
      const owner = await registerUser()
      const guest = await registerUser()

      await send(owner, '/api/tags', 'POST', { name: 'home' })
      const guestHome = await send<TagDto>(guest, '/api/tags', 'POST', { name: 'home' })
      await send(guest, '/api/tags', 'POST', { name: 'travel' })
      const task = await send<TaskDto>(guest, '/api/tasks', 'POST', { title: 'Clean up', tagIds: [guestHome.id] })

      const { token } = await invite(owner)
      await join(guest, token)

      const familyTags = await tags(owner)
      expect(familyTags.map(tag => tag.name).sort()).toEqual(['home', 'travel'])

      const tasks = await get<TaskDto[]>(guest, '/api/tasks')
      expect(tasks.find(item => item.id === task.id)!.tags).toEqual([expect.objectContaining({ name: 'home', id: familyTags.find(tag => tag.name === 'home')!.id })])
      expect(await get<TaskDto[]>(owner, '/api/tasks')).toEqual([])
    })

    it('shares the savings balance and keeps one opening balance per person', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      await deposit(owner, 1000, 'OPENING')
      await deposit(guest, 500, 'OPENING')
      await deposit(guest, 200)

      const { token } = await invite(owner)
      await join(guest, token)

      const shared = await savings(owner)
      expect(shared.balance).toBe(1700)
      expect(shared.opening).toBe(1500)
      await expect(deposit(guest, 1, 'OPENING')).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('family scope', () => {
    it('lets every member edit and delete shared transactions', async () => {
      const { owner, member } = await family()
      const food = await byKey(owner, 'food')
      const tx = await spend(member, food.id, 40)

      await send(owner, `/api/finance/transactions/${tx.id}`, 'PATCH', { amount: 45 })
      await send(owner, `/api/finance/transactions/${tx.id}`, 'DELETE')

      const trash = await get<{ transactions: TransactionDto[] }>(member, '/api/trash')
      expect(trash.transactions.map(item => item.id)).toEqual([tx.id])
    })

    it('keeps other families out', async () => {
      const { owner } = await family()
      const stranger = await registerUser()
      const food = await byKey(owner, 'food')
      const tx = await spend(owner, food.id, 40)
      const tag = await send<TagDto>(owner, '/api/tags', 'POST', { name: 'secret' })

      expect(await transactions(stranger)).toEqual([])
      expect((await tags(stranger)).map(item => item.id)).not.toContain(tag.id)
      await expect(send(stranger, `/api/finance/transactions/${tx.id}`, 'PATCH', { amount: 1 })).rejects.toMatchObject({ statusCode: 404 })
      await expect(spend(stranger, food.id, 1)).rejects.toMatchObject({ statusCode: 400 })
      await expect(send(stranger, '/api/tasks', 'POST', { title: 'x', tagIds: [tag.id] })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('keeps savings personal when the family does not share them', async () => {
      const { owner, member } = await family()
      await send(owner, '/api/household', 'PATCH', { shareSavings: false })
      await deposit(owner, 300)
      await deposit(member, 50)

      expect((await savings(owner)).balance).toBe(300)
      expect((await savings(member)).balance).toBe(50)

      await send(owner, '/api/household', 'PATCH', { shareSavings: true })
      expect((await savings(member)).balance).toBe(350)
    })
  })

  describe('concurrent joins', () => {
    const statusOf = (result: PromiseSettledResult<unknown>) =>
      result.status === 'rejected' ? (result.reason as { statusCode: number }).statusCode : 200

    it('lets only one of two people use the same invite', async () => {
      const owner = await registerUser()
      const first = await registerUser()
      const second = await registerUser()
      const { token } = await invite(owner)

      const results = await Promise.allSettled([join(first, token), join(second, token)])

      expect(results.map(statusOf).sort()).toEqual([200, 404])
      expect((await household(owner)).members).toHaveLength(2)
    })

    it('merges only one way when two people accept each other at once', async () => {
      const a = await registerUser()
      const b = await registerUser()
      const fromA = await invite(a)
      const fromB = await invite(b)

      const results = await Promise.allSettled([join(a, fromB.token), join(b, fromA.token)])

      expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
      expect(await householdOf(a.userId)).toBe(await householdOf(b.userId))
      expect((await household(a)).members).toHaveLength(2)
    })

    it('never drags someone who joined the joiner into a family that did not invite them', async () => {
      const host = await registerUser()
      const joiner = await registerUser()
      const tagalong = await registerUser()
      const toHost = await invite(host)
      const toJoiner = await invite(joiner)

      const results = await Promise.allSettled([join(joiner, toHost.token), join(tagalong, toJoiner.token)])

      expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
      expect(await householdOf(tagalong.userId)).not.toBe(await householdOf(host.userId))
      expect((await household(host)).members.length).toBeLessThanOrEqual(2)
    })
  })

  describe('leaving', () => {
    it('gives the leaver a copy of their own records and leaves the family intact', async () => {
      const { owner, member } = await family()
      const food = await byKey(owner, 'food')
      await spend(owner, food.id, 100)
      await spend(member, food.id, 30)
      await deposit(member, 70)
      const tag = await send<TagDto>(member, '/api/tags', 'POST', { name: 'gym' })
      await send(member, '/api/tasks', 'POST', { title: 'Run', tagIds: [tag.id] })

      const left = await leave(member)

      expect(left.members).toEqual([expect.objectContaining({ userId: member.userId, role: 'OWNER' })])
      expect((await household(owner)).members).toHaveLength(1)

      const own = await transactions(member)
      expect(own.map(tx => tx.amount)).toEqual([30])
      expect((await categories(member)).find(category => category.id === own[0]!.categoryId)?.key).toBe('food')
      expect((await savings(member)).balance).toBe(70)

      expect((await transactions(owner)).map(tx => tx.amount).sort()).toEqual([100, 30].sort())
      expect((await savings(owner)).balance).toBe(70)

      const [task] = await get<TaskDto[]>(member, '/api/tasks')
      expect(task!.tags.map(item => item.name)).toEqual(['gym'])
      expect(task!.tags[0]!.id).not.toBe(tag.id)
    })

    it('takes personal savings along when the family does not share them', async () => {
      const { owner, member } = await family()
      await send(owner, '/api/household', 'PATCH', { shareSavings: false })
      await deposit(member, 80)

      await leave(member)

      expect((await savings(member)).balance).toBe(80)
      expect(await prisma.savingsEntry.count({ where: { householdId: await householdOf(owner.userId) } })).toBe(0)
    })

    it('hands the family over to the longest member when the owner leaves', async () => {
      const { owner, member } = await family()

      await leave(owner)

      const rest = await household(member)
      expect(rest.role).toBe('OWNER')
      expect(rest.members).toEqual([expect.objectContaining({ userId: member.userId, role: 'OWNER' })])
    })

    it('lets the owner remove a member, but not themselves, and members remove nobody', async () => {
      const { owner, member } = await family()

      await expect(send(member, `/api/household/members/${owner.userId}`, 'DELETE')).rejects.toMatchObject({ statusCode: 403 })
      await expect(send(owner, `/api/household/members/${owner.userId}`, 'DELETE')).rejects.toMatchObject({ statusCode: 400 })

      const rest = await send<HouseholdDto>(owner, `/api/household/members/${member.userId}`, 'DELETE')

      expect(rest.members.map(item => item.userId)).toEqual([owner.userId])
      expect((await household(member)).role).toBe('OWNER')
    })
  })
})
