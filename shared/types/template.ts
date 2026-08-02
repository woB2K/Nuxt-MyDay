import type { z } from 'zod'
import type { createTemplateSchema, updateTemplateSchema } from '../schemas/template'

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
