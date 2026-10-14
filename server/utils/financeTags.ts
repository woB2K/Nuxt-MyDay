export async function ownedFinanceTagIds(householdId: string, tagIds: string[] | undefined): Promise<string[] | undefined> {
  if (!tagIds) return undefined

  const ids = [...new Set(tagIds)]
  if (ids.length === 0) return ids

  const owned = await prisma.financeTag.count({ where: { id: { in: ids }, householdId } })

  if (owned !== ids.length) throw createError({ statusCode: 400, message: 'Invalid tag IDs' })

  return ids
}
