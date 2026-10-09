import { getHousehold, lockHouseholds, mergeHousehold } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { hashToken } from '~~/server/utils/jwt'
import { inviteTokenSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token } = await readValidatedBody(event, inviteTokenSchema.parse)

  const userId = event.context.userId
  const household = await getHousehold(event)

  const targetId = await prisma.$transaction(async (tx) => {
    const invite = await tx.householdInvite.findUnique({ where: { tokenHash: hashToken(token) } })

    if (!invite || invite.expiresAt <= new Date()) throw createError({ statusCode: 404, message: 'Invite not found' })

    await lockHouseholds(tx, [household.id, invite.householdId])

    const member = await tx.householdMember.findUnique({ where: { userId } })

    if (member?.householdId !== household.id) throw createError({ statusCode: 409, message: 'Family has changed, try again' })
    if (invite.householdId === household.id) throw createError({ statusCode: 409, message: 'Already in this family' })

    const members = await tx.householdMember.count({ where: { householdId: household.id } })

    if (members > 1) throw createError({ statusCode: 409, message: 'Leave your current family first' })

    const { count } = await tx.householdInvite.deleteMany({ where: { id: invite.id, expiresAt: { gt: new Date() } } })

    if (count === 0) throw createError({ statusCode: 404, message: 'Invite not found' })

    await mergeHousehold(tx, household.id, invite.householdId)

    return invite.householdId
  })

  return householdView(targetId, event.context.userId)
})
