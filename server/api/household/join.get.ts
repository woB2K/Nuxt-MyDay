import { previewInvite } from '~~/server/utils/invite'
import { inviteTokenSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token } = await getValidatedQuery(event, inviteTokenSchema.parse)

  return previewInvite(event, token)
})
