import { z } from 'zod'

export const INVITE_TTL_DAYS = 7

export const updateHouseholdSchema = z.object({
  shareSavings: z.boolean()
})

export const inviteTokenSchema = z.object({
  token: z.string().min(1)
})

export const leaveHouseholdSchema = z.object({
  takeRecords: z.boolean().default(false)
})

export const memberParamsSchema = z.object({
  userId: z.string().min(1)
})

export const updateMemberSchema = z.object({
  role: z.literal('OWNER')
})
