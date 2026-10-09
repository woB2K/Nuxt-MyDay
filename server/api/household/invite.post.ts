import { randomBytes } from 'node:crypto'
import { getHousehold, lockMembership } from '~~/server/utils/household'
import { hashToken } from '~~/server/utils/jwt'
import { INVITE_TTL_DAYS } from '~~/shared/schemas'

const DAY_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * DAY_MS)

  await prisma.$transaction(async (tx) => {
    await lockMembership(tx, household.id, userId, { owner: true })
    await tx.householdInvite.deleteMany({ where: { householdId: household.id } })
    await tx.householdInvite.create({
      data: {
        householdId: household.id,
        createdById: userId,
        tokenHash: hashToken(token),
        expiresAt
      }
    })
  })

  return { token, expiresAt }
})
