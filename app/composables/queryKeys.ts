export const queryKeys = {
  categories: () => ['categories'] as const,
  transactions: (month: string) => ['transactions', { month }] as const,
  summary: (month: string) => ['summary', { month }] as const,
  savings: () => ['savings'] as const,
  budgets: (month: string) => ['budgets', { month }] as const,
  tasks: (filter: string, search: string) => ['tasks', { filter, search }] as const,
  tags: () => ['tags'] as const,
  templates: () => ['templates'] as const
}
