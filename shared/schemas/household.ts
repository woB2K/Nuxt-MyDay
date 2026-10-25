import { z } from 'zod'
import { CURRENCIES } from '../currency'

export const INVITE_TTL_DAYS = 7

export const currencySchema = z.enum(CURRENCIES)

export const updateHouseholdSchema = z.object({
  shareSavings: z.boolean().optional(),
  currency: currencySchema.optional()
}).refine(body => body.shareSavings !== undefined || body.currency !== undefined, 'Nothing to update')

export const inviteTokenSchema = z.object({
  token: z.string().min(1).max(128)
})

export const leaveHouseholdSchema = z.object({
  takeRecords: z.boolean().default(false)
})

export const memberParamsSchema = z.object({
  userId: z.string().min(1).max(64)
})

export const updateMemberSchema = z.object({
  role: z.literal('OWNER')
})
