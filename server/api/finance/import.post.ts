import type { Prisma } from '~~/prisma/.generated/prisma'
import type { ImportTransactionsResult } from '~~/shared/types'
import { createHash } from 'node:crypto'
import { FAMILY_TX_OPTIONS, getHousehold } from '~~/server/utils/household'
import { IMPORTED_CATEGORY_COLORS, IMPORTED_CATEGORY_ICON, importTransactionsSchema } from '~~/shared/schemas'

type TransactionType = 'INCOME' | 'EXPENSE'

const digest = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 32)

const nameKey = (name: string) => name.trim().toLocaleLowerCase()
const categoryKey = (name: string, type: TransactionType) => `${type}:${nameKey(name)}`

async function resolveCategories(tx: Prisma.TransactionClient, householdId: string, rows: Array<{ type: TransactionType, categoryId?: string, categoryName?: string }>) {
  const existing = await tx.category.findMany({ where: { householdId }, select: { id: true, name: true, type: true } })
  const byId = new Map(existing.map(category => [category.id, category]))
  const byName = new Map(existing.map(category => [categoryKey(category.name, category.type), category.id]))

  for (const row of rows) {
    if (!row.categoryId) continue
    const category = byId.get(row.categoryId)
    if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })
    if (category.type !== row.type) throw createError({ statusCode: 400, message: 'Category type does not match transaction type' })
  }

  const missing = new Map<string, { name: string, type: TransactionType }>()
  for (const row of rows) {
    if (!row.categoryName) continue
    const key = categoryKey(row.categoryName, row.type)
    if (!byName.has(key) && !missing.has(key)) missing.set(key, { name: row.categoryName.trim(), type: row.type })
  }

  let color = existing.length
  for (const [key, { name, type }] of missing) {
    const created = await tx.category.create({
      data: { householdId, name, type, icon: IMPORTED_CATEGORY_ICON, color: IMPORTED_CATEGORY_COLORS[color++ % IMPORTED_CATEGORY_COLORS.length]! },
      select: { id: true }
    })
    byName.set(key, created.id)
  }

  return {
    created: missing.size,
    idOf: (row: { type: TransactionType, categoryId?: string, categoryName?: string }) =>
      row.categoryId ?? byName.get(categoryKey(row.categoryName!, row.type))!
  }
}

async function resolveTags(tx: Prisma.TransactionClient, householdId: string, names: string[]) {
  const existing = await tx.financeTag.findMany({ where: { householdId }, select: { id: true, name: true } })
  const byName = new Map(existing.map(tag => [nameKey(tag.name), tag.id]))
  const missing = [...new Map(names.map(name => [nameKey(name), name.trim()])).entries()].filter(([key]) => !byName.has(key))

  for (const [key, name] of missing) {
    const created = await tx.financeTag.create({ data: { householdId, name }, select: { id: true } })
    byName.set(key, created.id)
  }

  return { created: missing.length, idOf: (name: string) => byName.get(nameKey(name))! }
}

export default defineEventHandler(async (event): Promise<ImportTransactionsResult> => {
  const userId = event.context.userId
  const household = await getHousehold(event)
  const { rows } = await readValidatedBody(event, importTransactionsSchema.parse)

  const withIds = rows.map(row => ({ ...row, id: digest(`${household.id}\n${row.fingerprint}`), importKey: digest(row.fingerprint) }))
  const unique = [...new Map(withIds.map(row => [row.id, row])).values()]

  return prisma.$transaction(async (tx) => {
    const present = await tx.transaction.findMany({
      where: { OR: [{ id: { in: unique.map(row => row.id) } }, { householdId: household.id, importKey: { in: unique.map(row => row.importKey) } }] },
      select: { id: true, importKey: true }
    })
    const presentIds = new Set(present.map(row => row.id))
    const presentKeys = new Set(present.map(row => row.importKey))

    const fresh = unique.filter(row => !presentIds.has(row.id) && !presentKeys.has(row.importKey))
    const categories = await resolveCategories(tx, household.id, fresh)
    const tags = await resolveTags(tx, household.id, fresh.flatMap(row => row.tags))

    const { count } = await tx.transaction.createMany({
      skipDuplicates: true,
      data: fresh.map(row => ({
        id: row.id,
        importKey: row.importKey,
        householdId: household.id,
        userId,
        type: row.type,
        amount: row.amount,
        notes: row.notes || null,
        categoryId: categories.idOf(row),
        date: new Date(row.date)
      }))
    })

    await tx.transactionTag.createMany({
      data: fresh.flatMap(row => [...new Set(row.tags.map(tags.idOf))].map(tagId => ({ transactionId: row.id, tagId }))),
      skipDuplicates: true
    })

    return { created: count, existing: rows.length - count, categories: categories.created, tags: tags.created }
  }, FAMILY_TX_OPTIONS)
})
