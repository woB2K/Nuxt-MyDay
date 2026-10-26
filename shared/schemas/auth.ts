import { z } from 'zod'
import { langSchema } from './settings'

export const baseAuthSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(30)
})

export const registerSchema = baseAuthSchema.extend({
  name: z.string().min(2).max(30),
  inviteToken: z.string().min(1).max(128).optional(),
  lang: langSchema.optional()
})

export const loginSchema = baseAuthSchema

export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional()
})
