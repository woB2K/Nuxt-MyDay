import type { z } from 'zod'
import type { trashKindSchema } from '../schemas/trash'
import type { SavingsEntryItem, TransactionItem } from './finance'
import type { HabitItem } from './habit'
import type { TaskItem } from './task'

export type TrashKind = z.infer<typeof trashKindSchema>

export interface TrashResponse {
  tasks: TaskItem[]
  habits: HabitItem[]
  transactions: TransactionItem[]
  savings: SavingsEntryItem[]
}
