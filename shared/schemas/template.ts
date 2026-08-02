import { z } from 'zod'
import { priorityEnum } from './task'

export const createTemplateSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  priority: priorityEnum.default('NONE'),
  tagsIds: z.array(z.string()).optional()
})

export const updateTemplateSchema = createTemplateSchema.partial()
