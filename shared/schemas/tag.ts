import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional()
})

export const updateTagSchema = createTagSchema.partial()
