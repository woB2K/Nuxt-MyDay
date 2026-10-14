import { z } from 'zod'
import { MAX_TASK_NOTES_LENGTH, MAX_TASK_TAGS, MAX_TITLE_LENGTH, priorityEnum } from './task'

export const createTemplateSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  notes: z.string().max(MAX_TASK_NOTES_LENGTH).optional(),
  priority: priorityEnum.default('NONE'),
  tagIds: z.array(z.string().min(1)).max(MAX_TASK_TAGS).optional()
})

export const updateTemplateSchema = createTemplateSchema.partial()
