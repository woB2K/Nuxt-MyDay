import type { H3Event } from 'h3'
import type { InviteState } from '~~/shared/types'
import { getHousehold } from '~~/server/utils/household'
import { hashToken } from '~~/server/utils/jwt'

export async function findInvite(event: H3Event, token: string) {
  const invite = await prisma.householdInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      createdBy: { select: { name: true } },
      household: { select: { shareSavings: true, _count: { select: { members: true } } } }
    }
  })

  if (!invite || invite.expiresAt <= new Date()) throw createError({ statusCode: 404, message: 'Invite not found' })

  const household = await getHousehold(event)

  let state: InviteState = 'ready'

  if (invite.householdId === household.id) {
    state = 'alreadyMember'
  } else {
    const members = await prisma.householdMember.count({ where: { householdId: household.id } })
    if (members > 1) state = 'mustLeave'
  }

  return { invite, household, state }
}
