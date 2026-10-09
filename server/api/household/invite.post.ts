import { randomBytes } from 'node:crypto'
import { getHousehold, requireOwner } from '~~/server/utils/household'
import { hashToken } from '~~/server/utils/jwt'
import { INVITE_TTL_DAYS } from '~~/shared/schemas'

const DAY_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)

  requireOwner(household)

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * DAY_MS)

  await prisma.$transaction([
    prisma.householdInvite.deleteMany({ where: { householdId: household.id } }),
    prisma.householdInvite.create({
      data: {
        householdId: household.id,
        createdById: event.context.userId,
        tokenHash: hashToken(token),
        expiresAt
      }
    })
  ])

  return { token, expiresAt }
})
