import type { Prisma } from '~~/prisma/.generated/prisma'

const DEFAULT_CATEGORIES: Omit<Prisma.CategoryCreateManyInput, 'userId'>[] = [
  { name: 'Food & Drink', icon: 'i-lucide-utensils', color: '#FB923C', type: 'EXPENSE' },
  { name: 'Transport', icon: 'i-lucide-car', color: '#60A5FA', type: 'EXPENSE' },
  { name: 'Shopping', icon: 'i-lucide-shopping-cart', color: '#F472B6', type: 'EXPENSE' },
  { name: 'Entertainment', icon: 'i-lucide-film', color: '#A78BFA', type: 'EXPENSE' },
  { name: 'Health', icon: 'i-lucide-heart-pulse', color: '#34D399', type: 'EXPENSE' },
  { name: 'Housing', icon: 'i-lucide-home', color: '#5EEAD4', type: 'EXPENSE' },
  { name: 'Education', icon: 'i-lucide-book-open', color: '#FBBF24', type: 'EXPENSE' },
  { name: 'Other', icon: 'i-lucide-package', color: '#F87171', type: 'EXPENSE' },
  { name: 'Salary', icon: 'i-lucide-wallet', color: '#34D399', type: 'INCOME' },
  { name: 'Freelance', icon: 'i-lucide-briefcase', color: '#60A5FA', type: 'INCOME' }
]

export async function seedCategories(tx: Prisma.TransactionClient, userId: string) {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId }))
  })
}
