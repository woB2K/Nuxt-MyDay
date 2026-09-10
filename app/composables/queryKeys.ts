export const queryKeys = {
  categories: () => ['categories'] as const,
  transactions: (period: string, filters: string) => ['transactions', { period, filters }] as const,
  transactionPages: (period: string, filters: string) => ['transactions', 'pages', { period, filters }] as const,
  summary: (period: string, filters: string) => ['summary', { period, filters }] as const,
  savings: () => ['savings'] as const,
  budgets: (period: string) => ['budgets', { period }] as const,
  tasks: (filter: string, search: string) => ['tasks', { filter, search }] as const,
  tags: () => ['tags'] as const,
  templates: () => ['templates'] as const
}
