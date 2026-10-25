import type { H3Event } from 'h3'
import { hashToken } from '~~/server/utils/jwt'

export function registrationOpen(event: H3Event): boolean {
  return String(useRuntimeConfig(event).allowRegistration) !== 'false'
}

export async function requireRegistration(event: H3Event, inviteToken?: string) {
  if (registrationOpen(event)) return

  const invite = inviteToken
    ? await prisma.householdInvite.findUnique({ where: { tokenHash: hashToken(inviteToken) }, select: { expiresAt: true } })
    : null

  if (!invite || invite.expiresAt <= new Date())
    throw createError({ statusCode: 403, message: 'Registration is closed' })
}
