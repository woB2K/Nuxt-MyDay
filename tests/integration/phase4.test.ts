import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb } from './helpers'

interface Category {
  id: string
  name: string
  key: string | null
  type: 'INCOME' | 'EXPENSE'
  isSystem: boolean
}

async function getCategories(token: string) {
  return $fetch<Category[]>('/api/categories', { headers: authHeaders(token) })
}

async function byKey(token: string, key: string) {
  return (await getCategories(token)).find(category => category.key === key)!
}

describe('phase 4 categories', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('сидирует обе системные «Другое» — под расходы и под доходы', async () => {
    const { token } = await registerUser()

    const categories = await getCategories(token)
    const system = categories.filter(category => category.isSystem)

    expect(system.map(category => category.key).sort()).toEqual(['other-expense', 'other-income'])
    expect(system.every(category => category.name === 'Other')).toBe(true)
  })

  it('переносит транзакции удалённой категории на «Другое» того же типа', async () => {
    const { token, userId } = await registerUser()
    const victim = await byKey(token, 'food')
    const fallback = await byKey(token, 'other-expense')

    const tx = await $fetch<{ id: string }>('/api/finance/transactions', {
      method: 'POST',
      headers: authHeaders(token),
      body: { type: 'EXPENSE', amount: 150, categoryId: victim.id, date: '2026-05-08' }
    })

    await $fetch(`/api/categories/${victim.id}`, { method: 'DELETE', headers: authHeaders(token) })

    const moved = await prisma.transaction.findUnique({ where: { id: tx.id } })
    expect(moved!.categoryId).toBe(fallback.id)
    expect(await prisma.category.findUnique({ where: { id: victim.id } })).toBeNull()
    expect(await prisma.transaction.count({ where: { userId } })).toBe(1)
  })

  it('удаляет бюджеты категории вместе с ней, а не переносит их', async () => {
    const { token, userId } = await registerUser()
    const victim = await byKey(token, 'transport')

    await prisma.budget.create({
      data: { userId, categoryId: victim.id, amount: 500, month: new Date('2026-05-01') }
    })

    await $fetch(`/api/categories/${victim.id}`, { method: 'DELETE', headers: authHeaders(token) })

    expect(await prisma.budget.count({ where: { userId } })).toBe(0)
  })

  it('не даёт удалить системную категорию и оставляет её на месте', async () => {
    const { token } = await registerUser()
    const system = await byKey(token, 'other-expense')

    await expect($fetch(`/api/categories/${system.id}`, {
      method: 'DELETE',
      headers: authHeaders(token)
    })).rejects.toMatchObject({ statusCode: 400 })

    expect(await prisma.category.findUnique({ where: { id: system.id } })).not.toBeNull()
  })

  it('не даёт сменить тип системной категории', async () => {
    const { token } = await registerUser()
    const system = await byKey(token, 'other-income')

    await expect($fetch(`/api/categories/${system.id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: { type: 'EXPENSE' }
    })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('переименование обнуляет key, чтобы дальше показывалось имя пользователя', async () => {
    const { token } = await registerUser()
    const category = await byKey(token, 'shopping')

    const renamed = await $fetch<Category>(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: { name: 'Покупки жене' }
    })

    expect(renamed.key).toBeNull()
  })

  it('смена цвета без переименования ключ не трогает', async () => {
    const { token } = await registerUser()
    const category = await byKey(token, 'health')

    const updated = await $fetch<Category>(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: { color: '#123456' }
    })

    expect(updated.key).toBe('health')
  })

  it('одно имя под разными типами больше не конфликтует', async () => {
    const { token } = await registerUser()

    const income = await $fetch<Category>('/api/categories', {
      method: 'POST',
      headers: authHeaders(token),
      body: { name: 'Gifts', icon: 'i-lucide-gift', color: '#F472B6', type: 'INCOME' }
    })
    const expense = await $fetch<Category>('/api/categories', {
      method: 'POST',
      headers: authHeaders(token),
      body: { name: 'Gifts', icon: 'i-lucide-gift', color: '#F472B6', type: 'EXPENSE' }
    })

    expect(income.id).not.toBe(expense.id)
  })
})
