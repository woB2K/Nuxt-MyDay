import type { z } from 'zod'
import type { createTaskSchema, updateTaskSchema } from '../schemas/task'

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
