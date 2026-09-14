import type { z } from 'zod'
import type { Tag, Task } from '~~/prisma/.generated/prisma'
import type { createTaskSchema, priorityEnum, updateTaskSchema } from '../schemas/task'

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskPriority = z.infer<typeof priorityEnum>

export type TaskItem = Task & { tags: Tag[] }
