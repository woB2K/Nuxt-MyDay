import type { z } from 'zod'
import type { Tag, Task } from '~~/prisma/.generated/prisma'
import type { createTaskSchema, updateTaskSchema } from '../schemas/task'

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export type TaskItem = Task & { tags: Tag[] }
