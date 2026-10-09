import { findInvite } from '~~/server/utils/invite'
import { inviteTokenSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token } = await getValidatedQuery(event, inviteTokenSchema.parse)

  const { invite, state } = await findInvite(event, token)

  return {
    inviterName: invite.createdBy.name,
    memberCount: invite.household._count.members,
    shareSavings: invite.household.shareSavings,
    state
  }
})
