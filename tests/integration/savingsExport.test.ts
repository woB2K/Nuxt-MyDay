import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb, setupApi } from './helpers'

describe('savings export', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  it('exports the period with goal, notes and author', async () => {
    const user = await registerUser()
    const headers = authHeaders(user.token)
    const goal = await $fetch<{ id: string }>('/api/finance/goals', { method: 'POST', headers, body: { name: 'Отпуск', target: 1000 } })
    const add = async (createdAt: string, body: object) => {
      const entry = await $fetch<{ id: string }>('/api/finance/savings', { method: 'POST', headers, body })
      await prisma.savingsEntry.update({ where: { id: entry.id }, data: { createdAt: new Date(createdAt) } })
      return entry
    }

    await add('2026-09-30T12:00:00Z', { amount: 500, type: 'OPENING' })
    await add('2026-10-03T12:00:00Z', { amount: 40, type: 'WITHDRAWAL', notes: '=1+1' })
    await add('2026-10-01T12:00:00Z', { amount: 100.5, type: 'DEPOSIT', goalId: goal.id, notes: 'Премия, часть' })
    const removed = await add('2026-10-02T12:00:00Z', { amount: 7, type: 'DEPOSIT' })
    await $fetch(`/api/finance/savings/${removed.id}`, { method: 'DELETE', headers })

    const csv = await $fetch<string>('/api/finance/savings/export', { headers, query: { from: '2026-10-01', to: '2026-10-31' }, responseType: 'text' })

    expect(csv.replace(/^\uFEFF/, '').trim().split('\r\n')).toEqual([
      'date,type,amount,currency,goal,notes,author',
      '2026-10-01,deposit,100.5,RUB,Отпуск,"Премия, часть",Test User',
      '2026-10-03,withdrawal,40,RUB,,\'=1+1,Test User'
    ])
  })

  it('does not reach other families and validates the query', async () => {
    const anna = await registerUser()
    const boris = await registerUser()
    await $fetch('/api/finance/savings', { method: 'POST', headers: authHeaders(anna.token), body: { amount: 5, type: 'DEPOSIT' } })

    const csv = await $fetch<string>('/api/finance/savings/export', { headers: authHeaders(boris.token), responseType: 'text' })

    expect(csv.trim().split('\r\n')).toHaveLength(1)
    await expect($fetch('/api/finance/savings/export')).rejects.toMatchObject({ statusCode: 401 })
    await expect($fetch('/api/finance/savings/export', { headers: authHeaders(boris.token), query: { from: 'yesterday' } })).rejects.toMatchObject({ statusCode: 400 })
    await expect($fetch('/api/finance/savings/export', { headers: authHeaders(boris.token), query: { from: '2026-10-02', to: '2026-10-01' } })).rejects.toMatchObject({ statusCode: 400 })
  })
})
