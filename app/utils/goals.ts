import { toDateString, toDayKey } from '~/utils/formatDate'

export interface GoalProgress {
  percent: number
  remaining: number
  reached: boolean
  overdue: boolean
  monthly: number | null
}

interface GoalLike {
  target: number
  saved: number
  deadline: Date | string | null
}

export function monthsLeft(deadline: string, today: string): number {
  const [fromYear, fromMonth] = today.split('-').map(Number)
  const [toYear, toMonth] = deadline.split('-').map(Number)

  return Math.max(1, (toYear! - fromYear!) * 12 + (toMonth! - fromMonth!) + 1)
}

export function goalProgress(goal: GoalLike, today = toDateString()): GoalProgress {
  const remaining = Math.max(0, goal.target - goal.saved)
  const reached = remaining === 0
  const deadline = goal.deadline ? toDayKey(goal.deadline) : null
  const overdue = !reached && deadline !== null && deadline < today
  const percent = goal.target > 0 ? Math.min(100, Math.max(0, (goal.saved / goal.target) * 100)) : 0

  return {
    percent,
    remaining,
    reached,
    overdue,
    monthly: deadline && !reached && !overdue ? Math.ceil(remaining / monthsLeft(deadline, today)) : null
  }
}
