import type { HouseholdResponse } from '~~/shared/types'

interface SavingsRow {
  userId: string
  type: string
  _count: { _all: number }
  _sum: { amount: { toNumber: () => number } | null }
}

const SAVINGS_SIGN: Record<string, number> = { OPENING: 1, DEPOSIT: 1, WITHDRAWAL: -1 }

function countBy(rows: Array<{ userId: string, _count: { _all: number } }>, userId: string): number {
  return rows
    .filter(row => row.userId === userId)
    .reduce((sum, row) => sum + row._count._all, 0)
}

function savingsBalanceOf(rows: SavingsRow[], userId: string): number {
  return rows
    .filter(row => row.userId === userId)
    .reduce((sum, row) => sum + (SAVINGS_SIGN[row.type] ?? 0) * (row._sum.amount?.toNumber() ?? 0), 0)
}

export async function householdView(householdId: string, userId: string): Promise<HouseholdResponse> {
  const where = { householdId, deletedAt: null }

  const [household, transactions, savings] = await Promise.all([
    prisma.household.findUniqueOrThrow({
      where: { id: householdId },
      include: {
        members: { orderBy: { joinedAt: 'asc' }, include: { user: { select: { name: true, email: true } } } },
        invites: { where: { expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 1 }
      }
    }),
    prisma.transaction.groupBy({ by: ['userId'], where, _count: { _all: true } }),
    prisma.savingsEntry.groupBy({ by: ['userId', 'type'], where, _count: { _all: true }, _sum: { amount: true } })
  ])

  const me = household.members.find(member => member.userId === userId)

  return {
    id: household.id,
    role: me?.role ?? 'MEMBER',
    shareSavings: household.shareSavings,
    removedNotice: Boolean(me?.removedAt),
    members: household.members.map(member => ({
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      colorIndex: member.colorIndex,
      joinedAt: member.joinedAt,
      transactionCount: countBy(transactions, member.userId),
      savingsCount: countBy(savings, member.userId),
      savingsBalance: household.shareSavings ? savingsBalanceOf(savings, member.userId) : null
    })),
    invite: household.invites[0] ? { expiresAt: household.invites[0].expiresAt } : null
  }
}
