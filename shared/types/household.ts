import type { z } from 'zod'
import type { HouseholdRole } from '~~/prisma/.generated/prisma'
import type { updateHouseholdSchema } from '../schemas/household'

export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>

export interface HouseholdMemberItem {
  userId: string
  name: string
  email: string
  role: HouseholdRole
  joinedAt: Date
}

export interface HouseholdResponse {
  id: string
  role: HouseholdRole
  shareSavings: boolean
  members: HouseholdMemberItem[]
  invite: { expiresAt: Date } | null
}

export interface InviteCreatedResponse {
  token: string
  expiresAt: Date
}

export type InviteState = 'ready' | 'alreadyMember' | 'mustLeave'

export interface InvitePreviewResponse {
  inviterName: string
  memberCount: number
  shareSavings: boolean
  state: InviteState
}
