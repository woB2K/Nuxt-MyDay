import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

interface EntryDto {
  id: string
  type: string
  amount: number
  userId: string
}

interface SavingsDto {
  balance: number
  own: number
  delta: number
  entries: EntryDto[]
}

interface HouseholdDto {
  members: Array<{ userId: string, savingsBalance: number | null }>
}

type User = Awaited<ReturnType<typeof registerUser>>

describe('savings reconcile api', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  const get = <T>(user: User, url: string) =>
    $fetch<T>(url, { headers: authHeaders(user.token) })

  const send = <T>(user: User, url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) =>
    $fetch<T>(url, { method, headers: authHeaders(user.token), body })

  const savings = (user: User) => get<SavingsDto>(user, '/api/finance/savings')
  const save = (user: User, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING' = 'DEPOSIT') =>
    send<EntryDto>(user, '/api/finance/savings', 'POST', { amount, type })
  const reconcile = (user: User, actual: number) =>
    send<EntryDto>(user, '/api/finance/savings/reconcile', 'POST', { actual })

  async function family() {
    const owner = await registerUser()
    const member = await registerUser()
    const { token } = await send<{ token: string }>(owner, '/api/household/invite', 'POST')
    await send(member, '/api/household/join', 'POST', { token })
    return { owner, member }
  }

  it('brings the balance down to the actual amount without touching the delta', async () => {
    const user = await registerUser()
    await save(user, 1000000, 'OPENING')
    await save(user, 240000)

    const entry = await reconcile(user, 380000)

    expect(entry).toMatchObject({ type: 'ADJUSTMENT', amount: -860000 })
    expect(await savings(user)).toMatchObject({ balance: 380000, own: 380000, delta: 240000 })
  })

  it('brings the balance up and keeps cents exact', async () => {
    const user = await registerUser()
    await save(user, 100.1)

    expect(await reconcile(user, 250.3)).toMatchObject({ amount: 150.2 })
    expect((await savings(user)).balance).toBe(250.3)
  })

  it('refuses when the balance already matches', async () => {
    const user = await registerUser()
    await save(user, 500)

    await expect(reconcile(user, 500)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('rejects a negative actual amount', async () => {
    const user = await registerUser()

    await expect(reconcile(user, -1)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('cannot be created through the regular endpoint', async () => {
    const user = await registerUser()

    await expect(send(user, '/api/finance/savings', 'POST', { amount: 10, type: 'ADJUSTMENT' })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('cannot be edited', async () => {
    const user = await registerUser()
    await save(user, 500)
    const entry = await reconcile(user, 300)

    await expect(send(user, `/api/finance/savings/${entry.id}`, 'PATCH', { amount: 10 })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('is undone by deleting and comes back on restore', async () => {
    const user = await registerUser()
    await save(user, 500)
    const entry = await reconcile(user, 300)

    await send(user, `/api/finance/savings/${entry.id}`, 'DELETE')
    expect((await savings(user)).balance).toBe(500)

    await send(user, `/api/finance/savings/${entry.id}/restore`, 'POST')
    expect((await savings(user)).balance).toBe(300)
  })

  it('reconciles only own share of shared savings', async () => {
    const { owner, member } = await family()
    await save(owner, 1000, 'OPENING')
    await save(member, 400, 'OPENING')

    expect(await reconcile(owner, 200)).toMatchObject({ amount: -800 })

    expect(await savings(member)).toMatchObject({ balance: 600, own: 400 })
    const { members } = await get<HouseholdDto>(owner, '/api/household')
    expect(Object.fromEntries(members.map(m => [m.userId, m.savingsBalance]))).toEqual({ [owner.userId]: 200, [member.userId]: 400 })
  })

  it('reconciles own savings when they are separate', async () => {
    const { owner, member } = await family()
    await send(owner, '/api/household', 'PATCH', { shareSavings: false })
    await save(owner, 1000)
    await save(member, 400)

    await reconcile(member, 100)

    expect(await savings(member)).toMatchObject({ balance: 100, own: 100 })
    expect(await savings(owner)).toMatchObject({ balance: 1000, own: 1000 })
  })
})
