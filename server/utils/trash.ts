import { TRASH_RETENTION_DAYS } from '~~/shared/schemas'

const DAY_MS = 24 * 60 * 60 * 1000

export function trashCutoff(now = new Date()): Date {
  return new Date(now.getTime() - TRASH_RETENTION_DAYS * DAY_MS)
}

export function inTrash(now = new Date()) {
  return { gte: trashCutoff(now) }
}

export async function purgeExpiredTrash(userId: string, now = new Date()) {
  const where = { userId, deletedAt: { lt: trashCutoff(now) } }

  await prisma.$transaction([
    prisma.task.deleteMany({ where }),
    prisma.transaction.deleteMany({ where }),
    prisma.savingsEntry.deleteMany({ where })
  ])
}
