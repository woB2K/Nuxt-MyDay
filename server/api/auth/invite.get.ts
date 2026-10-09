import { findValidInvite } from '~~/server/utils/invite'
import { inviteTokenSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token } = await getValidatedQuery(event, inviteTokenSchema.parse)

  const invite = await findValidInvite(token)

  return {
    inviterName: invite.createdBy.name,
    inviterColorIndex: invite.createdBy.membership?.colorIndex ?? 0
  }
})
