import type { H3Event } from 'h3'
import type { InviteState } from '~~/shared/types'
import { getHousehold, matchCategory } from '~~/server/utils/household'
import { hashToken } from '~~/server/utils/jwt'

export async function findValidInvite(token: string) {
  const invite = await prisma.householdInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      createdBy: { select: { name: true, membership: { select: { colorIndex: true } } } },
      household: {
        select: {
          shareSavings: true,
          members: { orderBy: { joinedAt: 'asc' }, select: { role: true, colorIndex: true, user: { select: { name: true } } } }
        }
      }
    }
  })

  if (!invite || invite.expiresAt <= new Date()) throw createError({ statusCode: 404, message: 'Invite not found' })

  return invite
}

async function savingsBalance(householdId: string): Promise<number> {
  const rows = await prisma.savingsEntry.groupBy({
    by: ['type'],
    where: { householdId, deletedAt: null },
    _sum: { amount: true }
  })

  const sum = (type: string) => rows.find(row => row.type === type)?._sum.amount?.toNumber() ?? 0

  return sum('OPENING') + sum('DEPOSIT') - sum('WITHDRAWAL')
}

export async function previewInvite(event: H3Event, token: string) {
  const invite = await findValidInvite(token)
  const household = await getHousehold(event)

  let state: InviteState = 'ready'

  if (invite.householdId === household.id) {
    state = 'alreadyMember'
  } else {
    const members = await prisma.householdMember.count({ where: { householdId: household.id } })
    if (members > 1) state = 'mustLeave'
  }

  const [transactionCount, mine, theirs, balance] = await Promise.all([
    prisma.transaction.count({ where: { householdId: household.id, deletedAt: null } }),
    prisma.category.findMany({ where: { householdId: household.id } }),
    prisma.category.findMany({ where: { householdId: invite.householdId } }),
    savingsBalance(household.id)
  ])

  return {
    inviterName: invite.createdBy.name,
    members: invite.household.members.map(member => ({ name: member.user.name, role: member.role, colorIndex: member.colorIndex })),
    shareSavings: invite.household.shareSavings,
    state,
    own: invite.createdById === event.context.userId,
    mine: {
      transactionCount,
      matchingCategories: mine
        .filter(category => matchCategory(category, theirs))
        .map(({ name, key }) => ({ name, key })),
      savingsBalance: balance
    }
  }
}
