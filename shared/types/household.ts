import type { z } from 'zod'
import type { HouseholdRole } from '~~/prisma/.generated/prisma'
import type { updateHouseholdSchema } from '../schemas/household'

export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>

export interface HouseholdMemberItem {
  userId: string
  name: string
  email: string
  role: HouseholdRole
  colorIndex: number
  joinedAt: Date
  transactionCount: number
  savingsCount: number
  savingsBalance: number | null
}

export interface HouseholdResponse {
  id: string
  role: HouseholdRole
  shareSavings: boolean
  removedNotice: boolean
  members: HouseholdMemberItem[]
  invite: { expiresAt: Date } | null
}

export interface InviteCreatedResponse {
  token: string
  expiresAt: Date
}

export type InviteState = 'ready' | 'alreadyMember' | 'mustLeave'

export interface InviteMember {
  name: string
  role: HouseholdRole
  colorIndex: number
}

export interface InvitePreviewResponse {
  inviterName: string
  members: InviteMember[]
  shareSavings: boolean
  state: InviteState
  own: boolean
  mine: {
    transactionCount: number
    matchingCategories: Array<{ name: string, key: string | null }>
    savingsBalance: number
  }
}

export interface GuestInvitePreviewResponse {
  inviterName: string
  inviterColorIndex: number
}
