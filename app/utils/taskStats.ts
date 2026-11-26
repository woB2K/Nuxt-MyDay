import type { TaskOrderKey } from '~~/shared/taskOrder'
import type { TaskItem } from '~~/shared/types'
import { compareTaskOrder } from '~~/shared/taskOrder'
import { toDateString, toLocalDate } from './formatDate'

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

function orderKey(task: TaskItem): TaskOrderKey {
  return {
    done: task.done,
    priority: task.priority,
    dueDay: task.dueDate ? taskDay(task.dueDate) : null,
    createdAt: new Date(task.createdAt).getTime()
  }
}

export function sortTasks(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((a, b) => compareTaskOrder(orderKey(a), orderKey(b)))
}

export function focusTask(tasks: TaskItem[]): TaskItem | null {
  return sortTasks(tasks.filter(task => !task.done))[0] ?? null
}
