import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i).optional()
})

export const updateTagSchema = createTagSchema.partial()
