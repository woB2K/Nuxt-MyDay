import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb } from './helpers'

interface Category { id: string, name: string, type: 'INCOME' | 'EXPENSE' }
interface Tx { id: string, amount: number, type: string }

async function getCategories(token: string) {
  return $fetch<Category[]>('/api/categories', { headers: authHeaders(token) })
}

// Хелпер: id первой категории нужного типа (сидируются при регистрации).
async function categoryId(token: string, type: 'INCOME' | 'EXPENSE') {
  const cats = await getCategories(token)
  return cats.find(c => c.type === type)!.id
}

describe('phase 2 api', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  describe('categories', () => {
    it('creates a category for the caller', async () => {
      const { token, userId } = await registerUser()

      const created = await $fetch<Category>('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: { name: 'Pets', type: 'EXPENSE', icon: 'i-lucide-dog', color: '#FFFFFF' }
      })

      expect(created.name).toBe('Pets')
      const inDb = await prisma.category.findUnique({ where: { id: created.id } })
      expect(inDb?.userId).toBe(userId)
    })

    it('rejects invalid body (empty name)', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: { name: '', type: 'EXPENSE', icon: 'i-lucide-dog', color: '#FFFFFF' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a body without icon or color with 400', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: { name: 'Pets', type: 'EXPENSE' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a malformed color with 400', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: { name: 'Pets', type: 'EXPENSE', icon: 'i-lucide-dog', color: 'orange' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('updates own category via PATCH', async () => {
      const { token } = await registerUser()
      const id = await categoryId(token, 'EXPENSE')

      const updated = await $fetch<Category>(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { name: 'Renamed' }
      })
      expect(updated.name).toBe('Renamed')
    })

    it('isolation: cannot read or delete another users category', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCatId = await categoryId(userA.token, 'EXPENSE')

      // B не видит категории A
      const bCats = await getCategories(userB.token)
      expect(bCats.some(c => c.id === aCatId)).toBe(false)

      // B не может удалить категорию A — и она остаётся в БД
      await expect($fetch(`/api/categories/${aCatId}`, {
        method: 'DELETE',
        headers: authHeaders(userB.token)
      })).rejects.toMatchObject({ statusCode: 404 })
      expect(await prisma.category.findUnique({ where: { id: aCatId } })).not.toBeNull()
    })

    it('answers 404 for PATCH and DELETE of a missing category', async () => {
      const { token } = await registerUser()

      await expect($fetch('/api/categories/clxmissing', {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { name: 'Nope' }
      })).rejects.toMatchObject({ statusCode: 404 })

      await expect($fetch('/api/categories/clxmissing', {
        method: 'DELETE',
        headers: authHeaders(token)
      })).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('transactions', () => {
    it('returns amount as number (Decimal mapped) on create', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')

      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 150.5, categoryId: catId, date: '2026-05-15' }
      })
      expect(typeof tx.amount).toBe('number')
      expect(tx.amount).toBe(150.5)
    })

    it('stores the calendar day it was given, without timezone shift', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')

      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: catId, date: '2026-09-01' }
      })

      const stored = await prisma.transaction.findUnique({ where: { id: tx.id } })
      expect(stored!.date.toISOString().slice(0, 10)).toBe('2026-09-01')
    })

    it('rejects a full ISO datetime date with 400', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')

      await expect($fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: catId, date: '2026-09-01T21:00:00.000Z' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('keeps the stored day when PATCH changes the date', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: catId, date: '2026-09-01' }
      })

      await $fetch(`/api/finance/transactions/${tx.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { date: '2026-10-31' }
      })

      const stored = await prisma.transaction.findUnique({ where: { id: tx.id } })
      expect(stored!.date.toISOString().slice(0, 10)).toBe('2026-10-31')
    })

    it('returns paginated shape with own transactions', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      await $fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: catId, date: '2026-05-15' }
      })

      const res = await $fetch<{ data: Tx[], total: number, page: number, limit: number }>(
        '/api/finance/transactions',
        { headers: authHeaders(token) }
      )
      expect(res.total).toBe(1)
      expect(res.data).toHaveLength(1)
      expect(res.page).toBe(1)
    })

    it('rejects negative amount', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      await expect($fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: -50, categoryId: catId, date: '2026-05-15' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('removes own transaction via DELETE', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: catId, date: '2026-05-15' }
      })

      await $fetch(`/api/finance/transactions/${tx.id}`, { method: 'DELETE', headers: authHeaders(token) })
      expect(await prisma.transaction.findUnique({ where: { id: tx.id } })).toBeNull()
    })

    it('rejects an unknown categoryId with 400', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: 'clxdoesnotexist', date: '2026-05-15' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects another users categoryId with 400', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCat = await categoryId(userA.token, 'EXPENSE')

      await expect($fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(userB.token),
        body: { type: 'EXPENSE', amount: 10, categoryId: aCat, date: '2026-05-15' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a category whose type does not match the transaction', async () => {
      const { token } = await registerUser()
      const incomeCat = await categoryId(token, 'INCOME')

      await expect($fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: incomeCat, date: '2026-05-15' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a PATCH moving a transaction to another users category', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCat = await categoryId(userA.token, 'EXPENSE')
      const bCat = await categoryId(userB.token, 'EXPENSE')

      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(userB.token),
        body: { type: 'EXPENSE', amount: 10, categoryId: bCat, date: '2026-05-15' }
      })

      await expect($fetch(`/api/finance/transactions/${tx.id}`, {
        method: 'PATCH',
        headers: authHeaders(userB.token),
        body: { categoryId: aCat }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a PATCH that leaves type and category mismatched', async () => {
      const { token } = await registerUser()
      const expenseCat = await categoryId(token, 'EXPENSE')
      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: expenseCat, date: '2026-05-15' }
      })

      await expect($fetch(`/api/finance/transactions/${tx.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { type: 'INCOME' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('allows a PATCH that switches type and category together', async () => {
      const { token } = await registerUser()
      const expenseCat = await categoryId(token, 'EXPENSE')
      const incomeCat = await categoryId(token, 'INCOME')
      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 10, categoryId: expenseCat, date: '2026-05-15' }
      })

      const updated = await $fetch<Tx>(`/api/finance/transactions/${tx.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { type: 'INCOME', categoryId: incomeCat }
      })
      expect(updated.type).toBe('INCOME')
    })

    it('answers 404 for PATCH and DELETE of a missing transaction', async () => {
      const { token } = await registerUser()

      await expect($fetch('/api/finance/transactions/clxmissing', {
        method: 'PATCH',
        headers: authHeaders(token),
        body: { amount: 5 }
      })).rejects.toMatchObject({ statusCode: 404 })

      await expect($fetch('/api/finance/transactions/clxmissing', {
        method: 'DELETE',
        headers: authHeaders(token)
      })).rejects.toMatchObject({ statusCode: 404 })
    })

    it('answers 404 when touching another users transaction', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCat = await categoryId(userA.token, 'EXPENSE')
      const tx = await $fetch<Tx>('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(userA.token),
        body: { type: 'EXPENSE', amount: 10, categoryId: aCat, date: '2026-05-15' }
      })

      await expect($fetch(`/api/finance/transactions/${tx.id}`, {
        method: 'DELETE',
        headers: authHeaders(userB.token)
      })).rejects.toMatchObject({ statusCode: 404 })
      expect(await prisma.transaction.findUnique({ where: { id: tx.id } })).not.toBeNull()
    })

    it('isolation: user B does not see user A transactions', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCat = await categoryId(userA.token, 'EXPENSE')
      await $fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(userA.token),
        body: { type: 'EXPENSE', amount: 99, categoryId: aCat, date: '2026-05-15' }
      })

      const res = await $fetch<{ total: number }>('/api/finance/transactions', { headers: authHeaders(userB.token) })
      expect(res.total).toBe(0)
    })
  })

  describe('transaction filters', () => {
    interface TxList { data: (Tx & { notes: string | null, categoryId: string })[], total: number, page: number, limit: number }

    async function listTx(token: string, query = '') {
      return $fetch<TxList>(`/api/finance/transactions${query}`, { headers: authHeaders(token) })
    }

    async function seedTransactions(token: string) {
      const cats = await getCategories(token)
      const food = cats.find(c => c.name === 'Food & Drink')!.id
      const transport = cats.find(c => c.name === 'Transport')!.id
      const salary = cats.find(c => c.type === 'INCOME')!.id

      const fixtures = [
        { type: 'EXPENSE', amount: 100, categoryId: food, date: '2026-08-20', notes: 'August lunch' },
        { type: 'EXPENSE', amount: 200, categoryId: food, date: '2026-09-05', notes: 'September LUNCH' },
        { type: 'EXPENSE', amount: 300, categoryId: transport, date: '2026-09-10', notes: 'Taxi' },
        { type: 'INCOME', amount: 5000, categoryId: salary, date: '2026-09-01', notes: 'Payday' },
        { type: 'EXPENSE', amount: 400, categoryId: food, date: '2026-10-02', notes: 'October dinner' }
      ]

      for (const body of fixtures) {
        await $fetch('/api/finance/transactions', { method: 'POST', headers: authHeaders(token), body })
      }

      return { food, transport, salary }
    }

    it('returns everything when from/to are omitted (mode "all")', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token)
      expect(res.total).toBe(5)
    })

    it('filters by date range inclusively on both bounds', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?from=2026-09-01&to=2026-09-30')
      expect(res.total).toBe(3)
      expect(res.data.map(t => t.amount).sort((a, b) => a - b)).toEqual([200, 300, 5000])
    })

    it('accepts an open-ended range (from only)', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?from=2026-09-01')
      expect(res.total).toBe(4)
    })

    it('filters by type', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?type=INCOME')
      expect(res.total).toBe(1)
      expect(res.data[0]!.amount).toBe(5000)
    })

    it('filters by a single category', async () => {
      const { token } = await registerUser()
      const { transport } = await seedTransactions(token)

      const res = await listTx(token, `?categoryIds=${transport}`)
      expect(res.total).toBe(1)
      expect(res.data[0]!.categoryId).toBe(transport)
    })

    it('filters by several categories', async () => {
      const { token } = await registerUser()
      const { food, transport } = await seedTransactions(token)

      const res = await listTx(token, `?categoryIds=${food},${transport}`)
      expect(res.total).toBe(4)
    })

    it('ignores an empty categoryIds value instead of matching nothing', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?categoryIds=')
      expect(res.total).toBe(5)
    })

    it('searches notes case-insensitively', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?search=lunch')
      expect(res.total).toBe(2)
    })

    it('combines filters', async () => {
      const { token } = await registerUser()
      const { food } = await seedTransactions(token)

      const res = await listTx(
        token,
        `?type=EXPENSE&categoryIds=${food}&search=lunch&from=2026-09-01&to=2026-09-30`
      )
      expect(res.total).toBe(1)
      expect(res.data[0]!.amount).toBe(200)
    })

    it('counts total over the filtered set, not the whole table', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const res = await listTx(token, '?type=EXPENSE&limit=2')
      expect(res.total).toBe(4)
      expect(res.data).toHaveLength(2)
      expect(res.limit).toBe(2)
    })

    it('paginates the filtered set', async () => {
      const { token } = await registerUser()
      await seedTransactions(token)

      const page2 = await listTx(token, '?type=EXPENSE&limit=2&page=2')
      expect(page2.total).toBe(4)
      expect(page2.data).toHaveLength(2)
      expect(page2.page).toBe(2)
    })

    it('paginates without repeating rows that share the same date', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      for (const amount of [1, 2, 3, 4]) {
        await $fetch('/api/finance/transactions', {
          method: 'POST',
          headers: authHeaders(token),
          body: { type: 'EXPENSE', amount, categoryId: catId, date: '2026-09-10' }
        })
      }

      const page1 = await listTx(token, '?limit=2&page=1')
      const page2 = await listTx(token, '?limit=2&page=2')
      const ids = [...page1.data, ...page2.data].map(t => t.id)

      expect(new Set(ids).size).toBe(4)
    })

    it('rejects from later than to with 400', async () => {
      const { token } = await registerUser()
      await expect(listTx(token, '?from=2026-09-30&to=2026-09-01'))
        .rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a bad limit with 400', async () => {
      const { token } = await registerUser()
      await expect(listTx(token, '?limit=500')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a full ISO datetime from with 400', async () => {
      const { token } = await registerUser()
      await expect(listTx(token, '?from=2026-09-01T00:00:00.000Z')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('isolation: filters never reach another users transactions', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const { food } = await seedTransactions(userA.token)

      const res = await listTx(userB.token, `?categoryIds=${food}`)
      expect(res.total).toBe(0)
    })
  })

  describe('summary aggregation', () => {
    it('computes income, expense, networth and sorted breakdown', async () => {
      const { token } = await registerUser()
      const expenseCat = await categoryId(token, 'EXPENSE')
      const incomeCat = await categoryId(token, 'INCOME')
      const cats = await getCategories(token)
      const secondExpense = cats.filter(c => c.type === 'EXPENSE')[1].id

      const post = (body: object) => $fetch('/api/finance/transactions', {
        method: 'POST', headers: authHeaders(token), body
      })
      await post({ type: 'INCOME', amount: 1000, categoryId: incomeCat, date: '2026-05-10' })
      await post({ type: 'EXPENSE', amount: 300, categoryId: expenseCat, date: '2026-05-12' })
      await post({ type: 'EXPENSE', amount: 200, categoryId: secondExpense, date: '2026-05-14' })

      const summary = await $fetch<{
        income: number
        expense: number
        networth: number
        breakdown: Array<{ total: number, category: { id: string } }>
      }>('/api/finance/summary', {
        headers: authHeaders(token),
        query: { from: '2026-05-01', to: '2026-05-31' }
      })

      expect(summary.income).toBe(1000)
      expect(summary.expense).toBe(500)
      expect(summary.networth).toBe(500)
      expect(summary.breakdown).toHaveLength(2)
      // breakdown отсортирован по убыванию суммы
      expect(summary.breakdown[0].total).toBe(300)
      expect(summary.breakdown[1].total).toBe(200)
    })

    it('excludes transactions outside the date range', async () => {
      const { token } = await registerUser()
      const expenseCat = await categoryId(token, 'EXPENSE')
      await $fetch('/api/finance/transactions', {
        method: 'POST', headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 777, categoryId: expenseCat, date: '2026-04-15' }
      })

      const summary = await $fetch<{ expense: number }>('/api/finance/summary', {
        headers: authHeaders(token),
        query: { from: '2026-05-01', to: '2026-05-31' }
      })
      expect(summary.expense).toBe(0)
    })

    it('covers all time when from/to are omitted', async () => {
      const { token } = await registerUser()
      const expenseCat = await categoryId(token, 'EXPENSE')
      const post = (date: string) => $fetch('/api/finance/transactions', {
        method: 'POST',
        headers: authHeaders(token),
        body: { type: 'EXPENSE', amount: 100, categoryId: expenseCat, date }
      })
      await post('2025-01-15')
      await post('2026-09-15')

      const summary = await $fetch<{ expense: number }>('/api/finance/summary', {
        headers: authHeaders(token)
      })
      expect(summary.expense).toBe(200)
    })

    it('rejects an inverted range with 400', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/finance/summary', {
        headers: authHeaders(token),
        query: { from: '2026-05-31', to: '2026-05-01' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects a full ISO datetime range with 400', async () => {
      const { token } = await registerUser()
      await expect($fetch('/api/finance/summary', {
        headers: authHeaders(token),
        query: { from: '2026-05-01T00:00:00.000Z' }
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    // 2.20: hero и breakdown считаются по тому же отфильтрованному набору,
    // что и список — значит summary принимает те же type/categoryIds/search.
    describe('filters', () => {
      interface Summary {
        income: number
        expense: number
        networth: number
        breakdown: Array<{ total: number, category: { id: string } }>
      }

      async function seed() {
        const { token } = await registerUser()
        const cats = await getCategories(token)
        const expenseCat = cats.find(c => c.type === 'EXPENSE')!.id
        const secondExpense = cats.filter(c => c.type === 'EXPENSE')[1]!.id
        const incomeCat = cats.find(c => c.type === 'INCOME')!.id

        const post = (body: object) => $fetch('/api/finance/transactions', {
          method: 'POST', headers: authHeaders(token), body
        })
        await post({ type: 'INCOME', amount: 1000, categoryId: incomeCat, date: '2026-05-10', notes: 'Payroll' })
        await post({ type: 'EXPENSE', amount: 300, categoryId: expenseCat, date: '2026-05-12', notes: 'Groceries' })
        await post({ type: 'EXPENSE', amount: 200, categoryId: secondExpense, date: '2026-05-14', notes: 'Taxi home' })

        const summary = (query: object) => $fetch<Summary>('/api/finance/summary', {
          headers: authHeaders(token),
          query
        })

        return { token, expenseCat, secondExpense, incomeCat, summary }
      }

      it('zeroes income and keeps the breakdown when type=EXPENSE', async () => {
        const { summary } = await seed()

        const result = await summary({ type: 'EXPENSE' })

        expect(result.income).toBe(0)
        expect(result.expense).toBe(500)
        expect(result.networth).toBe(-500)
        expect(result.breakdown).toHaveLength(2)
      })

      it('empties expense and breakdown when type=INCOME — breakdown is spend by category', async () => {
        const { summary } = await seed()

        const result = await summary({ type: 'INCOME' })

        expect(result.income).toBe(1000)
        expect(result.expense).toBe(0)
        expect(result.networth).toBe(1000)
        expect(result.breakdown).toEqual([])
      })

      it('narrows totals to the selected categories', async () => {
        const { expenseCat, summary } = await seed()

        const result = await summary({ categoryIds: expenseCat })

        expect(result.expense).toBe(300)
        expect(result.income).toBe(0)
        expect(result.breakdown).toHaveLength(1)
        expect(result.breakdown[0]!.category.id).toBe(expenseCat)
      })

      it('accepts several categories as a CSV list', async () => {
        const { expenseCat, secondExpense, summary } = await seed()

        const result = await summary({ categoryIds: `${expenseCat},${secondExpense}` })

        expect(result.expense).toBe(500)
        expect(result.breakdown).toHaveLength(2)
      })

      it('filters by notes, case-insensitively', async () => {
        const { summary } = await seed()

        const result = await summary({ search: 'taxi' })

        expect(result.expense).toBe(200)
        expect(result.income).toBe(0)
      })

      it('combines filters with the period', async () => {
        const { summary } = await seed()

        const result = await summary({ from: '2026-05-13', to: '2026-05-31', type: 'EXPENSE' })

        expect(result.expense).toBe(200)
      })
    })
  })

  describe('savings', () => {
    it('balance = sum(DEPOSIT) - sum(WITHDRAWAL) over all time', async () => {
      const { token } = await registerUser()
      const post = (body: object) => $fetch('/api/finance/savings', {
        method: 'POST', headers: authHeaders(token), body
      })
      await post({ amount: 10000, type: 'DEPOSIT' })
      await post({ amount: 5000, type: 'DEPOSIT' })
      await post({ amount: 3000, type: 'WITHDRAWAL' })

      const res = await $fetch<{ balance: number, entries: unknown[] }>('/api/finance/savings', {
        headers: authHeaders(token)
      })
      expect(res.balance).toBe(12000)
      expect(res.entries).toHaveLength(3)
    })

    it('removes an entry and updates balance', async () => {
      const { token } = await registerUser()
      const entry = await $fetch<{ id: string }>('/api/finance/savings', {
        method: 'POST', headers: authHeaders(token), body: { amount: 8000, type: 'DEPOSIT' }
      })

      await $fetch(`/api/finance/savings/${entry.id}`, { method: 'DELETE', headers: authHeaders(token) })
      const res = await $fetch<{ balance: number }>('/api/finance/savings', { headers: authHeaders(token) })
      expect(res.balance).toBe(0)
    })

    it('answers 404 when deleting another users entry', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const entry = await $fetch<{ id: string }>('/api/finance/savings', {
        method: 'POST', headers: authHeaders(userA.token), body: { amount: 8000, type: 'DEPOSIT' }
      })

      await expect($fetch(`/api/finance/savings/${entry.id}`, {
        method: 'DELETE', headers: authHeaders(userB.token)
      })).rejects.toMatchObject({ statusCode: 404 })
      expect(await prisma.savingsEntry.findUnique({ where: { id: entry.id } })).not.toBeNull()
    })
  })

  describe('budgets', () => {
    const postBudget = (token: string, body: object) => $fetch('/api/finance/budgets', {
      method: 'POST', headers: authHeaders(token), body
    })

    const listBudgets = (token: string, query?: Record<string, string>) =>
      $fetch<Array<{ amount: number }>>('/api/finance/budgets', { headers: authHeaders(token), query })

    it('rejects another users categoryId with 400', async () => {
      const userA = await registerUser()
      const userB = await registerUser()
      const aCat = await categoryId(userA.token, 'EXPENSE')

      await expect(postBudget(userB.token, {
        amount: 20000,
        categoryId: aCat,
        month: '2026-05-01T00:00:00.000Z'
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects an unknown categoryId with 400', async () => {
      const { token } = await registerUser()

      await expect(postBudget(token, {
        amount: 20000,
        categoryId: 'clxdoesnotexist',
        month: '2026-05-01T00:00:00.000Z'
      })).rejects.toMatchObject({ statusCode: 400 })
    })

    it('upserts: second POST for same category+month updates amount', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')
      const month = '2026-05-01T00:00:00.000Z'

      await postBudget(token, { amount: 20000, categoryId: catId, month })
      await postBudget(token, { amount: 25000, categoryId: catId, month })

      const budgets = await listBudgets(token, { from: '2026-05-01', to: '2026-05-31' })
      expect(budgets).toHaveLength(1)
      expect(budgets[0]!.amount).toBe(25000)
    })

    it('filters by the requested month instead of the servers current month', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')

      await postBudget(token, { amount: 20000, categoryId: catId, month: '2026-05-01T00:00:00.000Z' })
      await postBudget(token, { amount: 30000, categoryId: catId, month: '2026-06-01T00:00:00.000Z' })

      const may = await listBudgets(token, { from: '2026-05-01', to: '2026-05-31' })
      expect(may).toHaveLength(1)
      expect(may[0]!.amount).toBe(20000)

      const june = await listBudgets(token, { from: '2026-06-01', to: '2026-06-30' })
      expect(june).toHaveLength(1)
      expect(june[0]!.amount).toBe(30000)
    })

    it('returns every month when from/to are omitted', async () => {
      const { token } = await registerUser()
      const catId = await categoryId(token, 'EXPENSE')

      await postBudget(token, { amount: 20000, categoryId: catId, month: '2026-05-01T00:00:00.000Z' })
      await postBudget(token, { amount: 30000, categoryId: catId, month: '2026-06-01T00:00:00.000Z' })

      expect(await listBudgets(token)).toHaveLength(2)
    })

    it('rejects an inverted range with 400', async () => {
      const { token } = await registerUser()
      await expect(listBudgets(token, { from: '2026-06-01', to: '2026-05-01' }))
        .rejects.toMatchObject({ statusCode: 400 })
    })
  })
})
