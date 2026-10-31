import { $fetch } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, registerUser, resetDb, setupApi } from './helpers'

interface CategoryDto { id: string, key: string | null, type: 'INCOME' | 'EXPENSE' }

describe('transaction export', async () => {
  await setupApi()

  beforeEach(async () => {
    await resetDb()
  })

  it('exports the period with category, tags, author and currency', async () => {
    const user = await registerUser()
    const headers = authHeaders(user.token)
    const food = (await $fetch<CategoryDto[]>('/api/categories', { headers })).find(category => category.key === 'food')!
    const tag = await $fetch<{ id: string }>('/api/finance/tags', { method: 'POST', headers, body: { name: 'обед' } })
    const spend = (date: string, amount: number, extra: object = {}) =>
      $fetch('/api/finance/transactions', { method: 'POST', headers, body: { type: 'EXPENSE', amount, categoryId: food.id, date, ...extra } })

    await spend('2026-09-30', 10)
    await spend('2026-10-02', 12.5, { notes: 'Кофе, с собой', tagIds: [tag.id] })
    await spend('2026-10-01', 7)

    const csv = await $fetch<string>('/api/finance/export', { headers, query: { from: '2026-10-01', to: '2026-10-31', lang: 'ru' }, responseType: 'text' })

    expect(csv.replace(/^\uFEFF/, '').trim().split('\r\n')).toEqual([
      'date,type,amount,currency,category,tags,notes,author',
      '2026-10-01,expense,7,RUB,Еда и напитки,,,Test User',
      '2026-10-02,expense,12.5,RUB,Еда и напитки,обед,"Кофе, с собой",Test User'
    ])
  })

  it('does not reach other families and needs a session', async () => {
    const anna = await registerUser()
    const boris = await registerUser()
    const food = (await $fetch<CategoryDto[]>('/api/categories', { headers: authHeaders(anna.token) })).find(category => category.key === 'food')!
    await $fetch('/api/finance/transactions', { method: 'POST', headers: authHeaders(anna.token), body: { type: 'EXPENSE', amount: 5, categoryId: food.id, date: '2026-10-01' } })

    const csv = await $fetch<string>('/api/finance/export', { headers: authHeaders(boris.token), responseType: 'text' })

    expect(csv.trim().split('\r\n')).toHaveLength(1)
    await expect($fetch('/api/finance/export')).rejects.toMatchObject({ statusCode: 401 })
    await expect($fetch('/api/finance/export', { headers: authHeaders(boris.token), query: { from: 'yesterday' } })).rejects.toMatchObject({ statusCode: 400 })
    await expect($fetch('/api/finance/export', { headers: authHeaders(boris.token), query: { lang: 'de' } })).rejects.toMatchObject({ statusCode: 400 })
  })
})
