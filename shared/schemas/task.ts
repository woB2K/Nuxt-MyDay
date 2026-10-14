import { z } from 'zod'

export const MAX_TITLE_LENGTH = 200
export const MAX_TASK_NOTES_LENGTH = 2000
export const MAX_TASK_TAGS = 20

export const priorityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE'])

export const createTaskSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  notes: z.string().max(MAX_TASK_NOTES_LENGTH).optional(),
  priority: priorityEnum.default('NONE'),
  dueDate: z.iso.date().optional(),
  tagIds: z.array(z.string().min(1)).max(MAX_TASK_TAGS).optional()
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  done: z.boolean().optional(),
  dueDate: z.iso.date().nullable().optional()
})
