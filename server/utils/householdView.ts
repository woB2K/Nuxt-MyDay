import type { HouseholdResponse } from '~~/shared/types'

export async function householdView(householdId: string, role: HouseholdResponse['role']): Promise<HouseholdResponse> {
  const household = await prisma.household.findUniqueOrThrow({
    where: { id: householdId },
    include: {
      members: { orderBy: { joinedAt: 'asc' }, include: { user: { select: { name: true, email: true } } } },
      invites: { where: { expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 1 }
    }
  })

  return {
    id: household.id,
    role,
    shareSavings: household.shareSavings,
    members: household.members.map(member => ({
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      joinedAt: member.joinedAt
    })),
    invite: household.invites[0] ? { expiresAt: household.invites[0].expiresAt } : null
  }
}
