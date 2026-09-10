export const queryKeys = {
  categories: () => ['categories'] as const,
  transactions: (period: string) => ['transactions', { period }] as const,
  summary: (period: string) => ['summary', { period }] as const,
  savings: () => ['savings'] as const,
  budgets: (period: string) => ['budgets', { period }] as const,
  tasks: (filter: string, search: string) => ['tasks', { filter, search }] as const,
  tags: () => ['tags'] as const,
  templates: () => ['templates'] as const
}
