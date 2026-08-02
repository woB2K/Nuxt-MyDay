import { z } from 'zod'

const priorityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE'])

export const createTaskSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  priority: priorityEnum.default('NONE'),
  dueDate: z.iso.datetime().optional(),
  tagIds: z.array(z.string()).optional()
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  done: z.boolean().optional()
})
