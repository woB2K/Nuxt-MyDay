import type { HouseholdContext } from '~~/server/utils/household'
import { savingsScope } from '~~/server/utils/household'
import { TRASH_RETENTION_DAYS } from '~~/shared/schemas'

const DAY_MS = 24 * 60 * 60 * 1000

export function trashCutoff(now = new Date()): Date {
  return new Date(now.getTime() - TRASH_RETENTION_DAYS * DAY_MS)
}

export function inTrash(now = new Date()) {
  return { gte: trashCutoff(now) }
}

export function trashScopes(userId: string, household: HouseholdContext) {
  return {
    task: { userId },
    transaction: { householdId: household.id },
    savings: savingsScope(userId, household)
  }
}

export async function purgeExpiredTrash(userId: string, household: HouseholdContext, now = new Date()) {
  const scopes = trashScopes(userId, household)
  const deletedAt = { lt: trashCutoff(now) }

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { ...scopes.task, deletedAt } }),
    prisma.transaction.deleteMany({ where: { ...scopes.transaction, deletedAt } }),
    prisma.savingsEntry.deleteMany({ where: { ...scopes.savings, deletedAt } })
  ])
}
