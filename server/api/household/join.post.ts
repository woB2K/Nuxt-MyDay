import { mergeHousehold } from '~~/server/utils/household'
import { householdView } from '~~/server/utils/householdView'
import { findInvite } from '~~/server/utils/invite'
import { inviteTokenSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token } = await readValidatedBody(event, inviteTokenSchema.parse)

  const { invite, household, state } = await findInvite(event, token)

  if (state === 'alreadyMember') throw createError({ statusCode: 409, message: 'Already in this family' })
  if (state === 'mustLeave') throw createError({ statusCode: 409, message: 'Leave your current family first' })

  await prisma.$transaction(async (tx) => {
    await tx.householdInvite.delete({ where: { id: invite.id } })
    await mergeHousehold(tx, household.id, invite.householdId)
  })

  return householdView(invite.householdId, 'MEMBER')
})
