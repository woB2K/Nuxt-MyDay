import type { H3Event } from 'h3'
import type { HouseholdRole, Prisma } from '~~/prisma/.generated/prisma'

export interface HouseholdContext {
  id: string
  role: HouseholdRole
  shareSavings: boolean
}

export async function getHousehold(event: H3Event): Promise<HouseholdContext> {
  if (event.context.household) return event.context.household

  const membership = await prisma.householdMember.findUnique({
    where: { userId: event.context.userId },
    include: { household: { select: { shareSavings: true } } }
  })

  if (!membership) throw createError({ statusCode: 500, message: 'Household is missing' })

  const household: HouseholdContext = {
    id: membership.householdId,
    role: membership.role,
    shareSavings: membership.household.shareSavings
  }

  event.context.household = household

  return household
}

export function requireOwner(household: HouseholdContext) {
  if (household.role !== 'OWNER') throw createError({ statusCode: 403, message: 'Only the family owner can do this' })
}

export async function lockHouseholds(tx: Prisma.TransactionClient, ids: string[]) {
  for (const id of [...new Set(ids)].sort())
    await tx.$queryRaw`SELECT 1 FROM "Household" WHERE "id" = ${id} FOR UPDATE`
}

export async function lockMembership(tx: Prisma.TransactionClient, householdId: string, userId: string, { owner = false } = {}) {
  await lockHouseholds(tx, [householdId])

  const member = await tx.householdMember.findUnique({ where: { userId } })

  if (member?.householdId !== householdId) throw createError({ statusCode: 409, message: 'Family has changed, try again' })
  if (owner && member.role !== 'OWNER') throw createError({ statusCode: 403, message: 'Only the family owner can do this' })

  return member
}

export function savingsScope(userId: string, household: HouseholdContext): Prisma.SavingsEntryWhereInput {
  return household.shareSavings
    ? { householdId: household.id }
    : { householdId: household.id, userId }
}

interface Named { id: string, name: string }
interface Typed extends Named { type: string, key: string | null }

function matchCategory<T extends Typed>(category: T, candidates: T[]): T | undefined {
  const sameType = candidates.filter(candidate => candidate.type === category.type)

  return (category.key ? sameType.find(candidate => candidate.key === category.key) : undefined)
    ?? sameType.find(candidate => candidate.name === category.name)
}

function matchTag<T extends Named>(tag: T, candidates: T[]): T | undefined {
  return candidates.find(candidate => candidate.name === tag.name)
}

export async function mergeHousehold(tx: Prisma.TransactionClient, fromId: string, toId: string) {
  const [sourceCategories, targetCategories] = await Promise.all([
    tx.category.findMany({ where: { householdId: fromId } }),
    tx.category.findMany({ where: { householdId: toId } })
  ])

  for (const category of sourceCategories) {
    const match = matchCategory(category, targetCategories)

    if (!match) {
      await tx.category.update({ where: { id: category.id }, data: { householdId: toId } })
      continue
    }

    await tx.transaction.updateMany({ where: { categoryId: category.id }, data: { categoryId: match.id } })

    const budgets = await tx.budget.findMany({ where: { categoryId: category.id } })

    for (const budget of budgets) {
      const taken = await tx.budget.count({ where: { householdId: toId, categoryId: match.id, month: budget.month } })

      if (taken > 0) await tx.budget.delete({ where: { id: budget.id } })
      else await tx.budget.update({ where: { id: budget.id }, data: { categoryId: match.id } })
    }

    await tx.category.delete({ where: { id: category.id } })
  }

  const [sourceTags, targetTags] = await Promise.all([
    tx.tag.findMany({ where: { householdId: fromId } }),
    tx.tag.findMany({ where: { householdId: toId } })
  ])

  for (const tag of sourceTags) {
    const match = matchTag(tag, targetTags)

    if (!match) {
      await tx.tag.update({ where: { id: tag.id }, data: { householdId: toId } })
      continue
    }

    await tx.taskTag.updateMany({ where: { tagId: tag.id }, data: { tagId: match.id } })
    await tx.taskTemplateTag.updateMany({ where: { tagId: tag.id }, data: { tagId: match.id } })
    await tx.tag.delete({ where: { id: tag.id } })
  }

  const move = { where: { householdId: fromId }, data: { householdId: toId } }

  await tx.budget.updateMany(move)
  await tx.transaction.updateMany(move)
  await tx.savingsEntry.updateMany(move)
  await tx.householdMember.updateMany({ ...move, data: { householdId: toId, role: 'MEMBER', joinedAt: new Date() } })
  await tx.household.delete({ where: { id: fromId } })
}

export async function detachMember(tx: Prisma.TransactionClient, householdId: string, userId: string, actorId = userId) {
  await lockMembership(tx, householdId, actorId, { owner: actorId !== userId })

  const household = await tx.household.findUniqueOrThrow({
    where: { id: householdId },
    include: { members: { orderBy: { joinedAt: 'asc' } } }
  })

  const member = household.members.find(item => item.userId === userId)

  if (!member) throw createError({ statusCode: 404, message: 'Member not found' })
  if (household.members.length === 1) throw createError({ statusCode: 400, message: 'You are not in a family' })

  const fresh = await tx.household.create({ data: {} })

  const categories = await tx.category.findMany({ where: { householdId } })
  const categoryIds = new Map<string, string>()

  for (const { id, name, key, icon, color, type, isSystem } of categories) {
    const copy = await tx.category.create({ data: { householdId: fresh.id, name, key, icon, color, type, isSystem } })
    categoryIds.set(id, copy.id)
  }

  const transactions = await tx.transaction.findMany({ where: { householdId, userId, deletedAt: null } })

  await tx.transaction.createMany({
    data: transactions.map(({ type, amount, notes, date, categoryId }) => ({
      householdId: fresh.id,
      userId,
      type,
      amount,
      notes,
      date,
      categoryId: categoryIds.get(categoryId)!
    }))
  })

  if (household.shareSavings) {
    const entries = await tx.savingsEntry.findMany({ where: { householdId, userId, deletedAt: null } })

    await tx.savingsEntry.createMany({
      data: entries.map(({ amount, type, notes, createdAt }) => ({ householdId: fresh.id, userId, amount, type, notes, createdAt }))
    })
  } else {
    await tx.savingsEntry.updateMany({ where: { householdId, userId }, data: { householdId: fresh.id } })
  }

  const tags = await tx.tag.findMany({
    where: {
      householdId,
      OR: [
        { tasks: { some: { task: { userId } } } },
        { templates: { some: { template: { userId } } } }
      ]
    }
  })

  for (const tag of tags) {
    const copy = await tx.tag.create({ data: { householdId: fresh.id, name: tag.name, color: tag.color } })

    await tx.taskTag.updateMany({ where: { tagId: tag.id, task: { userId } }, data: { tagId: copy.id } })
    await tx.taskTemplateTag.updateMany({ where: { tagId: tag.id, template: { userId } }, data: { tagId: copy.id } })
  }

  await tx.householdInvite.deleteMany({ where: { householdId, createdById: userId } })

  await tx.householdMember.update({
    where: { userId },
    data: { householdId: fresh.id, role: 'OWNER', joinedAt: new Date() }
  })

  const successor = household.members.find(item => item.userId !== userId)

  if (member.role === 'OWNER' && successor) {
    await tx.householdMember.update({ where: { userId: successor.userId }, data: { role: 'OWNER' } })
  }

  return fresh
}
