import type { TrashKind, TrashResponse } from '~~/shared/types'
import { TRASH_RETENTION_DAYS } from '~~/shared/schemas'

const DAY_MS = 24 * 60 * 60 * 1000

function without<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter(item => item.id !== id)
}

export function dropFromTrash(cache: TrashResponse, kind: TrashKind, id: string): TrashResponse {
  return {
    tasks: kind === 'task' ? without(cache.tasks, id) : cache.tasks,
    transactions: kind === 'transaction' ? without(cache.transactions, id) : cache.transactions,
    savings: kind === 'savings' ? without(cache.savings, id) : cache.savings
  }
}

export function emptyTrash(): TrashResponse {
  return { tasks: [], transactions: [], savings: [] }
}

export function trashSize(cache?: TrashResponse): number {
  return cache ? cache.tasks.length + cache.transactions.length + cache.savings.length : 0
}

export function trashDaysLeft(deletedAt: Date | string, now = new Date()): number {
  const expiresAt = new Date(deletedAt).getTime() + TRASH_RETENTION_DAYS * DAY_MS

  return Math.max(1, Math.ceil((expiresAt - now.getTime()) / DAY_MS))
}
