import { z } from 'zod'

export const TRASH_RETENTION_DAYS = 30

export const trashKindSchema = z.enum(['task', 'transaction', 'savings'])

export const trashItemParamsSchema = z.object({
  kind: trashKindSchema,
  id: z.string().min(1)
})
