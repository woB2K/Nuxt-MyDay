import type { z } from 'zod'
import type { createTagSchema, updateTagSchema } from '../schemas/tag'

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
