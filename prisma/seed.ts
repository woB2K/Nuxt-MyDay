import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './.generated/prisma/index.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const USER_EMAIL = 'admin@mail.ru'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randAmount(min: number, max: number) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
    include: { categories: true }
  })

  if (!user) {
    console.error(`User ${USER_EMAIL} not found`)
    process.exit(1)
  }

  console.log(`Seeding data for ${user.name} (${user.id})`)

  const expenseCategories = user.categories.filter(c => c.type === 'EXPENSE')
  const incomeCategories = user.categories.filter(c => c.type === 'INCOME')

  const now = new Date()
  const transactions = []

  // Generate 3 months of transactions
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const year = now.getMonth() - monthOffset < 0
      ? now.getFullYear() - 1
      : now.getFullYear()
    const month = ((now.getMonth() - monthOffset) + 12) % 12
    const days = daysInMonth(year, month)
    const maxDay = monthOffset === 0 ? now.getDate() : days

    // Salary on the 5th
    if (maxDay >= 5) {
      const salCat = incomeCategories.find(c => c.name === 'Salary') ?? incomeCategories[0]
      transactions.push({
        userId: user.id,
        type: 'INCOME' as const,
        amount: randAmount(4500, 5500),
        categoryId: salCat.id,
        notes: 'Monthly salary',
        date: new Date(Date.UTC(year, month, 5))
      })
    }

    // Freelance once or twice randomly
    const freeCat = incomeCategories.find(c => c.name === 'Freelance') ?? incomeCategories[0]
    const freelanceDays = [rand(10, 15), rand(20, 28)].filter(d => d <= maxDay)
    for (const d of freelanceDays) {
      if (Math.random() > 0.4) {
        transactions.push({
          userId: user.id,
          type: 'INCOME' as const,
          amount: randAmount(300, 900),
          categoryId: freeCat.id,
          notes: 'Freelance project',
          date: new Date(Date.UTC(year, month, d))
        })
      }
    }

    // Rent on the 1st
    const housingCat = expenseCategories.find(c => c.name === 'Housing') ?? expenseCategories[0]
    transactions.push({
      userId: user.id,
      type: 'EXPENSE' as const,
      amount: randAmount(900, 1100),
      categoryId: housingCat.id,
      notes: 'Rent',
      date: new Date(Date.UTC(year, month, 1))
    })

    // Random daily expenses across the month
    const expensePool = [
      { cat: 'Food & Drink', min: 8, max: 60, freq: 20 },
      { cat: 'Transport', min: 5, max: 30, freq: 12 },
      { cat: 'Shopping', min: 20, max: 150, freq: 6 },
      { cat: 'Entertainment', min: 10, max: 80, freq: 5 },
      { cat: 'Health', min: 15, max: 120, freq: 3 },
      { cat: 'Education', min: 20, max: 100, freq: 2 },
      { cat: 'Other', min: 5, max: 50, freq: 4 }
    ]

    for (const { cat, min, max, freq } of expensePool) {
      const category = expenseCategories.find(c => c.name === cat) ?? expenseCategories[0]
      const count = rand(Math.floor(freq * 0.5), freq)
      for (let i = 0; i < count; i++) {
        const day = rand(1, maxDay)
        transactions.push({
          userId: user.id,
          type: 'EXPENSE' as const,
          amount: randAmount(min, max),
          categoryId: category.id,
          notes: null,
          date: new Date(Date.UTC(year, month, day))
        })
      }
    }
  }

  await prisma.transaction.createMany({ data: transactions })
  console.log(`Created ${transactions.length} transactions`)

  // Savings entries
  const savingsData = [
    { amount: 500, type: 'DEPOSIT' as const, notes: 'Emergency fund', daysAgo: 85 },
    { amount: 300, type: 'DEPOSIT' as const, notes: 'Vacation savings', daysAgo: 60 },
    { amount: 200, type: 'DEPOSIT' as const, notes: null, daysAgo: 45 },
    { amount: 150, type: 'WITHDRAWAL' as const, notes: 'Car repair', daysAgo: 30 },
    { amount: 400, type: 'DEPOSIT' as const, notes: null, daysAgo: 15 },
    { amount: 250, type: 'DEPOSIT' as const, notes: 'Monthly savings', daysAgo: 3 }
  ]

  for (const s of savingsData) {
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - s.daysAgo)
    await prisma.savingsEntry.create({
      data: { userId: user.id, amount: s.amount, type: s.type, notes: s.notes, createdAt }
    })
  }
  console.log(`Created ${savingsData.length} savings entries`)

  // Budgets for current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const budgetDefs = [
    { cat: 'Food & Drink', amount: 600 },
    { cat: 'Transport', amount: 200 },
    { cat: 'Shopping', amount: 400 },
    { cat: 'Entertainment', amount: 300 },
    { cat: 'Health', amount: 200 }
  ]

  for (const { cat, amount } of budgetDefs) {
    const category = expenseCategories.find(c => c.name === cat)
    if (!category) continue
    await prisma.budget.upsert({
      where: { userId_categoryId_month: { userId: user.id, categoryId: category.id, month: monthStart } },
      update: { amount },
      create: { userId: user.id, categoryId: category.id, amount, month: monthStart }
    })
  }
  console.log(`Created ${budgetDefs.length} budgets`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
