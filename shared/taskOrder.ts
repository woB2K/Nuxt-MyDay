export type TaskOrderPriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

export interface TaskOrderKey {
  done: boolean
  priority: TaskOrderPriority
  dueDay: string | null
  createdAt: number
}

const PRIORITY_WEIGHT: Record<TaskOrderPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }

export function compareTaskOrder(a: TaskOrderKey, b: TaskOrderKey): number {
  if (a.done !== b.done) return a.done ? 1 : -1

  const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  if (byPriority !== 0) return byPriority

  if (a.dueDay !== b.dueDay) {
    if (!a.dueDay) return 1
    if (!b.dueDay) return -1

    return a.dueDay < b.dueDay ? -1 : 1
  }

  return a.createdAt - b.createdAt
}
