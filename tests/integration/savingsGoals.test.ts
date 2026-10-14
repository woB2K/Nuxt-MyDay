import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

interface GoalDto {
  id: string
  name: string
  target: number
  saved: number
  deadline: string | null
}

interface EntryDto {
  id: string
  goalId: string | null
}

type User = Awaited<ReturnType<typeof registerUser>>

describe('savings goals api', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const get = <T>(user: User, url: string) =>
    $fetch<T>(url, { headers: authHeaders(user.token) })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  const goals = (user: User) => get<GoalDto[]>(user, '/api/finance/goals')
  const addGoal = (user: User, name: string, target = 1000, deadline: string | null = null) =>
    send<GoalDto>(user, '/api/finance/goals', 'POST', { name, target, deadline })
  const save = (user: User, amount: number, goalId?: string | null, type: 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING' = 'DEPOSIT') =>
    send<EntryDto>(user, '/api/finance/savings', 'POST', { amount, type, goalId })

  async function family() {
    const owner = await registerUser()
    const member = await registerUser()
    const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
    await send(member, '/api/household/join', 'POST', { token })
    return { owner, member }
  }

  describe('crud', () => {
    it('creates, edits and deletes a goal', async () => {
      const user = await registerUser()
      const goal = await addGoal(user, 'Отпуск', 120000, '2027-06-01')

      expect(goal).toMatchObject({ name: 'Отпуск', target: 120000, saved: 0 })
      expect(goal.deadline).toContain('2027-06-01')

      const edited = await send<GoalDto>(user, `/api/finance/goals/${goal.id}`, 'PATCH', { target: 150000, deadline: null })
      expect(edited).toMatchObject({ target: 150000, deadline: null })

      await send(user, `/api/finance/goals/${goal.id}`, 'DELETE')
      expect(await goals(user)).toEqual([])
    })

    it('keeps other families out', async () => {
      const owner = await registerUser()
      const stranger = await registerUser()
      const goal = await addGoal(owner, 'Отпуск')

      expect(await goals(stranger)).toEqual([])
      await expect(send(stranger, `/api/finance/goals/${goal.id}`, 'PATCH', { name: 'X' })).rejects.toMatchObject({ statusCode: 404 })
      await expect(save(stranger, 10, goal.id)).rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('progress', () => {
    it('counts deposits minus withdrawals of the goal, without deleted entries', async () => {
      const user = await registerUser()
      const trip = await addGoal(user, 'Отпуск')
      const car = await addGoal(user, 'Машина')
      await save(user, 500, null, 'OPENING')
      await save(user, 300, trip.id)
      await save(user, 200, trip.id)
      await save(user, 100, trip.id, 'WITHDRAWAL')
      await save(user, 50, car.id)
      await save(user, 70)
      const deleted = await save(user, 1000, trip.id)
      await send(user, `/api/finance/savings/${deleted.id}`, 'DELETE')

      expect((await goals(user)).map(goal => [goal.name, goal.saved])).toEqual([['Отпуск', 400], ['Машина', 50]])
    })

    it('moves an entry between goals on edit', async () => {
      const user = await registerUser()
      const trip = await addGoal(user, 'Отпуск')
      const car = await addGoal(user, 'Машина')
      const entry = await save(user, 300, trip.id)

      expect((await send<EntryDto>(user, `/api/finance/savings/${entry.id}`, 'PATCH', { goalId: car.id })).goalId).toBe(car.id)
      expect((await goals(user)).map(goal => goal.saved)).toEqual([0, 300])

      await send(user, `/api/finance/savings/${entry.id}`, 'PATCH', { goalId: null })
      expect((await goals(user)).map(goal => goal.saved)).toEqual([0, 0])
    })

    it('does not let the opening balance belong to a goal', async () => {
      const user = await registerUser()
      const goal = await addGoal(user, 'Отпуск')

      await expect(save(user, 500, goal.id, 'OPENING')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('keeps entries when their goal is deleted', async () => {
      const user = await registerUser()
      const goal = await addGoal(user, 'Отпуск')
      await save(user, 300, goal.id)

      await send(user, `/api/finance/goals/${goal.id}`, 'DELETE')

      const savings = await get<{ balance: number, entries: EntryDto[] }>(user, '/api/finance/savings')
      expect(savings.balance).toBe(300)
      expect(savings.entries[0]!.goalId).toBeNull()
    })
  })

  describe('family', () => {
    it('shares goals and their progress while savings are shared', async () => {
      const { owner, member } = await family()
      const goal = await addGoal(owner, 'Отпуск')
      await save(owner, 100, goal.id)
      await save(member, 200, goal.id)

      expect((await goals(member)).map(item => item.saved)).toEqual([300])
    })

    it('keeps goals personal when savings are separate', async () => {
      const { owner, member } = await family()
      await send(owner, '/api/household', 'PATCH', { shareSavings: false })
      const goal = await addGoal(owner, 'Отпуск')

      expect(await goals(member)).toEqual([])
      await expect(save(member, 10, goal.id)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('moves the goals of a newcomer into the family', async () => {
      const owner = await registerUser()
      const guest = await registerUser()
      const goal = await addGoal(guest, 'Отпуск')
      await save(guest, 300, goal.id)

      const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
      await send(guest, '/api/household/join', 'POST', { token })

      expect((await goals(owner)).map(item => [item.name, item.saved])).toEqual([['Отпуск', 300]])
    })

    it('gives the leaver copies of shared goals with their own progress', async () => {
      const { owner, member } = await family()
      const goal = await addGoal(owner, 'Отпуск')
      await save(owner, 100, goal.id)
      await save(member, 200, goal.id)

      await send(member, '/api/household/leave', 'POST')

      expect((await goals(member)).map(item => [item.name, item.saved])).toEqual([['Отпуск', 200]])
      expect((await goals(owner)).map(item => [item.name, item.saved])).toEqual([['Отпуск', 300]])
    })

    it('takes own goals along and unlinks others from them when savings are separate', async () => {
      const { owner, member } = await family()
      const shared = await addGoal(member, 'Отпуск')
      await save(owner, 100, shared.id)
      await send(owner, '/api/household', 'PATCH', { shareSavings: false })
      await save(member, 50, shared.id)

      await send(member, '/api/household/leave', 'POST')

      expect((await goals(member)).map(item => [item.name, item.saved])).toEqual([['Отпуск', 50]])
      const ownerSavings = await get<{ entries: EntryDto[] }>(owner, '/api/finance/savings')
      expect(ownerSavings.entries[0]!.goalId).toBeNull()
    })
  })
})
