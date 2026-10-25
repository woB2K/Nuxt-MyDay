import type { ExtraServer } from './helpers'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DEMO_EMAILS, resetDemo } from '../../scripts/admin/demo'
import { prisma, resetDb, setupApi, startExtraServer } from './helpers'

describe('demo instance', async () => {
  await setupApi()

  let demo: ExtraServer

  beforeAll(async () => {
    demo = await startExtraServer(3912, { NUXT_DEMO: 'true', NUXT_ALLOW_REGISTRATION: 'false', NUXT_DEMO_PASSWORD: 'demo-pass-1' })
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(() => {
    demo.stop()
  })

  async function login() {
    const { accessToken } = await demo.request<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': `10.43.0.${Math.floor(Math.random() * 250)}` },
      body: { email: DEMO_EMAILS.owner, password: 'demo-pass-1' }
    })
    return { Authorization: `Bearer ${accessToken}` }
  }

  it('fills a family of two with three months of history', async () => {
    await resetDemo(prisma, { lang: 'ru', password: 'demo-pass-1', rounds: 4 })

    const household = await prisma.household.findFirstOrThrow({ include: { members: true } })
    expect(household).toMatchObject({ currency: 'RUB' })
    expect(household.members).toHaveLength(2)
    expect(await prisma.transaction.count()).toBeGreaterThan(60)
    expect(await prisma.task.count()).toBeGreaterThan(5)
    expect(await prisma.habitMark.count()).toBeGreaterThan(20)
    expect(await prisma.savingsGoal.count()).toBe(1)
  })

  it('gives the same family every time it resets', async () => {
    await resetDemo(prisma, { lang: 'en', password: 'demo-pass-1', rounds: 4 })
    const first = await prisma.transaction.aggregate({ _sum: { amount: true }, _count: true })

    await resetDemo(prisma, { lang: 'en', password: 'demo-pass-1', rounds: 4 })
    const second = await prisma.transaction.aggregate({ _sum: { amount: true }, _count: true })

    expect(second._count).toBe(first._count)
    expect(second._sum.amount?.toString()).toBe(first._sum.amount?.toString())
    expect(await prisma.household.findFirstOrThrow()).toMatchObject({ currency: 'USD' })
  })

  it('tells the welcome screen the demo account and lets it in', async () => {
    await resetDemo(prisma, { password: 'demo-pass-1', rounds: 4 })

    expect(await demo.request('/api/auth/instance')).toEqual({
      registration: false,
      demo: { email: DEMO_EMAILS.owner, password: 'demo-pass-1' }
    })

    const headers = await login()
    expect(await demo.request<{ data: unknown[] }>('/api/finance/transactions', { headers })).toMatchObject({ data: expect.any(Array) })
  })

  it('locks what one visitor could use to spoil the demo for the others, and nothing else', async () => {
    await resetDemo(prisma, { password: 'demo-pass-1', rounds: 4 })
    const headers = await login()
    const categories = await demo.request<Array<{ id: string, type: string }>>('/api/categories', { headers })

    await expect(demo.request('/api/settings/pin', { method: 'PUT', headers, body: { pin: '1234' } })).rejects.toMatchObject({ statusCode: 403 })
    await expect(demo.request('/api/household', { method: 'PATCH', headers, body: { currency: 'EUR' } })).rejects.toMatchObject({ statusCode: 403 })
    await expect(demo.request('/api/household/invite', { method: 'POST', headers })).rejects.toMatchObject({ statusCode: 403 })
    await expect(demo.request('/api/household/leave', { method: 'POST', headers, body: {} })).rejects.toMatchObject({ statusCode: 403 })

    await expect(demo.request('/api/finance/transactions', {
      method: 'POST',
      headers,
      body: { type: 'EXPENSE', amount: 10, categoryId: categories.find(category => category.type === 'EXPENSE')!.id, date: '2026-10-01' }
    })).resolves.toMatchObject({ amount: 10 })
  })
})
