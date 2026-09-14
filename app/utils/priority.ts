import type { TaskPriority } from '~~/shared/types'

export const priorityKeys: TaskPriority[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH']

export const priorityBarClass: Record<TaskPriority, string> = {
  HIGH: 'bg-p-high',
  MEDIUM: 'bg-p-med',
  LOW: 'bg-p-low',
  NONE: 'bg-p-none'
}

export const priorityTextClass: Record<TaskPriority, string> = {
  HIGH: 'text-p-high',
  MEDIUM: 'text-p-med',
  LOW: 'text-p-low',
  NONE: 'text-p-none'
}
