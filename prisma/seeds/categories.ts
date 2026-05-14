import type { Prisma } from '~~/prisma/.generated/prisma'

const DEFAULT_CATEGORIES: Omit<Prisma.CategoryCreateManyInput, 'userId'>[] = [
  { name: 'Food & Drink', icon: '🍔', type: 'EXPENSE' },
  { name: 'Transport', icon: '🚗', type: 'EXPENSE' },
  { name: 'Shopping', icon: '🛍️', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎬', type: 'EXPENSE' },
  { name: 'Health', icon: '💊', type: 'EXPENSE' },
  { name: 'Housing', icon: '🏠', type: 'EXPENSE' },
  { name: 'Education', icon: '📚', type: 'EXPENSE' },
  { name: 'Other', icon: '📦', type: 'EXPENSE' },
  { name: 'Salary', icon: '💰', type: 'INCOME' },
  { name: 'Freelance', icon: '💻', type: 'INCOME' }
]

export async function seedCategories(tx: Prisma.TransactionClient, userId: string) {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId }))
  })
}
