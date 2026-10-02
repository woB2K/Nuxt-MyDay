import type { TaskItem, TaskPriority } from '~~/shared/types'
import { toDateString, toLocalDate } from './formatDate'

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }

export function taskDay(value: Date | string): string {
  return toDateString(toLocalDate(value))
}

export function todayTasks(tasks: TaskItem[], today: string = toDateString()): TaskItem[] {
  return tasks.filter((task) => {
    if (task.done) return task.doneAt ? taskDay(task.doneAt) === today : false

    return !task.dueDate || taskDay(task.dueDate) <= today
  })
}

export function doneTodayCount(tasks: TaskItem[], today: string = toDateString()): number {
  return tasks.filter(task => task.done && task.doneAt && taskDay(task.doneAt) === today).length
}

export function completionStreak(tasks: TaskItem[], today: Date = new Date()): number {
  const days = new Set(
    tasks
      .filter(task => task.done && task.doneAt)
      .map(task => taskDay(task.doneAt!))
  )

  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!days.has(toDateString(cursor))) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (days.has(toDateString(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function sortTasks(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1

    const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
    if (byPriority !== 0) return byPriority

    const dueA = a.dueDate ? taskDay(a.dueDate) : ''
    const dueB = b.dueDate ? taskDay(b.dueDate) : ''
    if (dueA !== dueB) {
      if (!dueA) return 1
      if (!dueB) return -1

      return dueA < dueB ? -1 : 1
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

export function focusTask(tasks: TaskItem[]): TaskItem | null {
  return sortTasks(tasks.filter(task => !task.done))[0] ?? null
}
