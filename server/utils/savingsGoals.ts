import type { Prisma, SavingsGoal } from '~~/prisma/.generated/prisma'
import type { HouseholdContext } from '~~/server/utils/household'
import { goalScope, savingsScope } from '~~/server/utils/household'

const SIGN: Record<string, number> = { DEPOSIT: 1, WITHDRAWAL: -1 }

export async function withSaved(goals: SavingsGoal[], scope: Prisma.SavingsEntryWhereInput) {
  const rows = goals.length
    ? await prisma.savingsEntry.groupBy({
        by: ['goalId', 'type'],
        where: { ...scope, deletedAt: null, goalId: { in: goals.map(goal => goal.id) } },
        _sum: { amount: true }
      })
    : []

  return goals.map(goal => ({
    ...goal,
    target: goal.target.toNumber(),
    saved: rows
      .filter(row => row.goalId === goal.id)
      .reduce((sum, row) => sum + (SIGN[row.type] ?? 0) * (row._sum.amount?.toNumber() ?? 0), 0)
  }))
}

export async function savedGoal(goal: SavingsGoal, userId: string, household: HouseholdContext) {
  const [item] = await withSaved([goal], savingsScope(userId, household))
  return item!
}

export async function assertGoal(goalId: string | null | undefined, userId: string, household: HouseholdContext) {
  if (!goalId) return

  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, ...goalScope(userId, household) } })

  if (!goal) throw createError({ statusCode: 400, message: 'Invalid goal ID' })
}
