import type { Prisma } from '~~/prisma/.generated/prisma'

const DEFAULT_CATEGORIES: Omit<Prisma.CategoryCreateManyInput, 'userId'>[] = [
  { name: 'Food & Drink', key: 'food', icon: 'i-lucide-utensils', color: '#FB923C', type: 'EXPENSE' },
  { name: 'Transport', key: 'transport', icon: 'i-lucide-car', color: '#60A5FA', type: 'EXPENSE' },
  { name: 'Shopping', key: 'shopping', icon: 'i-lucide-shopping-cart', color: '#F472B6', type: 'EXPENSE' },
  { name: 'Entertainment', key: 'entertainment', icon: 'i-lucide-film', color: '#A78BFA', type: 'EXPENSE' },
  { name: 'Health', key: 'health', icon: 'i-lucide-heart-pulse', color: '#34D399', type: 'EXPENSE' },
  { name: 'Housing', key: 'housing', icon: 'i-lucide-home', color: '#5EEAD4', type: 'EXPENSE' },
  { name: 'Education', key: 'education', icon: 'i-lucide-book-open', color: '#FBBF24', type: 'EXPENSE' },
  { name: 'Other', key: 'other-expense', icon: 'i-lucide-package', color: '#F87171', type: 'EXPENSE', isSystem: true },
  { name: 'Salary', key: 'salary', icon: 'i-lucide-wallet', color: '#34D399', type: 'INCOME' },
  { name: 'Freelance', key: 'freelance', icon: 'i-lucide-briefcase', color: '#60A5FA', type: 'INCOME' },
  { name: 'Other', key: 'other-income', icon: 'i-lucide-package', color: '#34D399', type: 'INCOME', isSystem: true }
]

export const systemCategoryKeys = {
  EXPENSE: 'other-expense',
  INCOME: 'other-income'
} as const

export async function seedCategories(tx: Prisma.TransactionClient, userId: string) {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId }))
  })
}
