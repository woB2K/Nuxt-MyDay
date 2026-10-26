import type { PrismaClient } from '../../prisma/.generated/prisma/index.js'
import bcrypt from 'bcrypt'
import { seedCategories } from '../../prisma/seeds/categories'

export type DemoLang = 'en' | 'ru'

export interface DemoAccount {
  email: string
  password: string
}

export const DEMO_EMAILS = { owner: 'anna@example.com', partner: 'boris@example.com' }

type Text = Record<DemoLang, string>

const PEOPLE = {
  owner: { ru: 'Анна', en: 'Anna' },
  partner: { ru: 'Борис', en: 'Boris' }
}

const CURRENCY: Record<DemoLang, string> = { ru: 'RUB', en: 'USD' }
const RATE: Record<DemoLang, number> = { ru: 1, en: 1 / 90 }

interface Spend {
  key: string
  every: number
  min: number
  max: number
  notes: Text[]
  who?: 'owner' | 'partner'
}

const SPENDS: Spend[] = [
  { key: 'food', every: 2, min: 600, max: 3800, notes: [{ ru: 'Пятёрочка', en: 'Groceries' }, { ru: 'ВкусВилл', en: 'Farmers market' }, { ru: '', en: '' }, { ru: 'Кофе с собой', en: 'Coffee to go' }] },
  { key: 'transport', every: 4, min: 90, max: 900, notes: [{ ru: 'Метро', en: 'Metro' }, { ru: 'Такси', en: 'Taxi' }, { ru: '', en: '' }], who: 'partner' },
  { key: 'entertainment', every: 9, min: 700, max: 4500, notes: [{ ru: 'Кино', en: 'Cinema' }, { ru: 'Ужин в кафе', en: 'Dinner out' }, { ru: 'Подписка на музыку', en: 'Music subscription' }] },
  { key: 'shopping', every: 11, min: 1200, max: 9000, notes: [{ ru: 'Одежда', en: 'Clothes' }, { ru: 'Для дома', en: 'Home stuff' }, { ru: '', en: '' }] },
  { key: 'health', every: 17, min: 500, max: 4200, notes: [{ ru: 'Аптека', en: 'Pharmacy' }, { ru: 'Стоматолог', en: 'Dentist' }] }
]

const TAGS = [{ ru: 'отпуск', en: 'vacation' }, { ru: 'дача', en: 'cottage' }, { ru: 'подарки', en: 'gifts' }]

const TASK_TAGS = [{ ru: 'дом', en: 'home', color: '#60A5FA' }, { ru: 'работа', en: 'work', color: '#F472B6' }]

const TASKS: Array<{ title: Text, due: number | null, done?: boolean, priority?: 'HIGH' | 'MEDIUM' | 'LOW', tag?: number, who?: 'partner' }> = [
  { title: { ru: 'Оплатить интернет', en: 'Pay the internet bill' }, due: 0, priority: 'HIGH', tag: 0 },
  { title: { ru: 'Записать Мишу к врачу', en: 'Book a doctor for Mike' }, due: 1, priority: 'MEDIUM', tag: 0 },
  { title: { ru: 'Отправить отчёт за квартал', en: 'Send the quarterly report' }, due: 0, priority: 'HIGH', tag: 1 },
  { title: { ru: 'Купить подарок маме', en: 'Buy a present for mom' }, due: 5, tag: 0 },
  { title: { ru: 'Продлить страховку машины', en: 'Renew the car insurance' }, due: -1, priority: 'HIGH' },
  { title: { ru: 'Разобрать балкон', en: 'Clear out the balcony' }, due: null, priority: 'LOW', tag: 0 },
  { title: { ru: 'Созвон с командой', en: 'Team call' }, due: 0, done: true, tag: 1 },
  { title: { ru: 'Забрать посылку', en: 'Pick up the parcel' }, due: -1, done: true },
  { title: { ru: 'Поменять резину', en: 'Swap the tyres' }, due: 3, who: 'partner' },
  { title: { ru: 'Починить кран на кухне', en: 'Fix the kitchen tap' }, due: 0, who: 'partner' }
]

const HABITS: Array<{ name: Text, icon: string, color: string, perWeek: number | null, chance: number }> = [
  { name: { ru: 'Вода 2 литра', en: 'Drink water' }, icon: 'droplet', color: 'blue', perWeek: null, chance: 0.85 },
  { name: { ru: 'Тренировка', en: 'Workout' }, icon: 'dumbbell', color: 'orange', perWeek: 3, chance: 0.45 },
  { name: { ru: 'Чтение', en: 'Reading' }, icon: 'book-open', color: 'violet', perWeek: null, chance: 0.7 },
  { name: { ru: 'Без сладкого', en: 'No sweets' }, icon: 'ban', color: 'pink', perWeek: null, chance: 0.6 }
]

export async function foreignAccounts(prisma: PrismaClient): Promise<number> {
  return prisma.user.count({ where: { email: { notIn: Object.values(DEMO_EMAILS) } } })
}

function random(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function dayOffset(days: number, today = new Date()): Date {
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + days))
}

export async function resetDemo(prisma: PrismaClient, { lang = 'ru' as DemoLang, password = 'demo-family', rounds = 12, days = 92 } = {}): Promise<DemoAccount> {
  const next = random(20261025)
  const between = (min: number, max: number) => min + next() * (max - min)
  const money = (rub: number) => {
    const value = rub * RATE[lang]
    return lang === 'ru' || rub >= 9000 ? Math.round(value) : Math.round(value * 100) / 100
  }
  const pick = <T>(list: T[]) => list[Math.floor(next() * list.length)]!
  const passwordHash = await bcrypt.hash(password, rounds)

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Household" RESTART IDENTITY CASCADE')

  await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({ data: { currency: CURRENCY[lang], nextColor: 2 } })
    await seedCategories(tx, household.id)

    const people = {} as Record<'owner' | 'partner', string>
    for (const role of ['owner', 'partner'] as const) {
      const user = await tx.user.create({
        data: {
          name: PEOPLE[role][lang],
          email: DEMO_EMAILS[role],
          passwordHash,
          createdAt: dayOffset(-days),
          settings: { create: { lang } },
          membership: { create: { householdId: household.id, role: role === 'owner' ? 'OWNER' : 'MEMBER', colorIndex: role === 'owner' ? 0 : 1, joinedAt: dayOffset(-days) } }
        }
      })
      people[role] = user.id
    }

    const categories = Object.fromEntries((await tx.category.findMany({ where: { householdId: household.id } })).map(category => [category.key, category.id]))
    const tags = await Promise.all(TAGS.map(tag => tx.financeTag.create({ data: { householdId: household.id, name: tag[lang] } })))

    const transactions: Array<{ householdId: string, userId: string, type: 'INCOME' | 'EXPENSE', amount: number, categoryId: string, notes: string | null, date: Date }> = []
    const add = (who: 'owner' | 'partner', type: 'INCOME' | 'EXPENSE', key: string, rub: number, notes: string, date: Date) =>
      transactions.push({ householdId: household.id, userId: people[who], type, amount: money(rub), categoryId: categories[key]!, notes: notes || null, date })

    for (let offset = -days; offset <= 0; offset++) {
      const date = dayOffset(offset)
      const day = date.getUTCDate()

      if (day === 5) add('owner', 'INCOME', 'salary', 95000, lang === 'ru' ? 'Зарплата' : 'Salary', date)
      if (day === 10) add('partner', 'INCOME', 'salary', 120000, lang === 'ru' ? 'Зарплата' : 'Salary', date)
      if (day === 18 && next() > 0.4) add('owner', 'INCOME', 'freelance', between(12000, 30000), lang === 'ru' ? 'Перевод статьи' : 'Translation gig', date)
      if (day === 1) add('partner', 'EXPENSE', 'housing', 45000, lang === 'ru' ? 'Аренда' : 'Rent', date)
      if (day === 12) add('owner', 'EXPENSE', 'housing', between(5200, 6800), lang === 'ru' ? 'Коммуналка' : 'Utilities', date)
      if (day === 20) add('owner', 'EXPENSE', 'education', 6500, lang === 'ru' ? 'Английский для Миши' : 'English classes for Mike', date)

      for (const spend of SPENDS) {
        if (next() > 1 / spend.every) continue
        add(spend.who ?? (next() > 0.5 ? 'owner' : 'partner'), 'EXPENSE', spend.key, between(spend.min, spend.max), pick(spend.notes)[lang], date)
      }
    }

    const vacationDay = dayOffset(-14)
    add('owner', 'EXPENSE', 'shopping', 18500, lang === 'ru' ? 'Билеты в Тбилиси' : 'Flights to Tbilisi', vacationDay)
    add('partner', 'EXPENSE', 'entertainment', 7200, lang === 'ru' ? 'Подарок на юбилей' : 'Anniversary present', dayOffset(-30))

    await tx.transaction.createMany({ data: transactions })

    const tagged = await tx.transaction.findMany({ where: { householdId: household.id, OR: [{ notes: { contains: lang === 'ru' ? 'Тбилиси' : 'Tbilisi' } }, { notes: { contains: lang === 'ru' ? 'Подарок' : 'present' } }] } })
    await tx.transactionTag.createMany({
      data: tagged.map(item => ({ transactionId: item.id, tagId: (item.notes?.includes(lang === 'ru' ? 'Тбилиси' : 'Tbilisi') ? tags[0] : tags[2])!.id }))
    })

    const goal = await tx.savingsGoal.create({
      data: { householdId: household.id, userId: people.owner, name: lang === 'ru' ? 'Отпуск в Грузии' : 'Holiday in Georgia', target: money(200000), deadline: dayOffset(150) }
    })
    await tx.savingsEntry.create({ data: { householdId: household.id, userId: people.owner, type: 'OPENING', amount: money(150000), createdAt: dayOffset(-days) } })
    await tx.savingsEntry.create({ data: { householdId: household.id, userId: people.partner, type: 'OPENING', amount: money(60000), createdAt: dayOffset(-days) } })
    for (const offset of [-75, -45, -15]) {
      await tx.savingsEntry.create({ data: { householdId: household.id, userId: people.owner, type: 'DEPOSIT', amount: money(15000), goalId: goal.id, notes: lang === 'ru' ? 'В копилку на отпуск' : 'Holiday fund', createdAt: dayOffset(offset) } })
      await tx.savingsEntry.create({ data: { householdId: household.id, userId: people.partner, type: 'DEPOSIT', amount: money(10000), createdAt: dayOffset(offset + 2) } })
    }
    await tx.savingsEntry.create({ data: { householdId: household.id, userId: people.partner, type: 'WITHDRAWAL', amount: money(8000), notes: lang === 'ru' ? 'Ремонт машины' : 'Car repair', createdAt: dayOffset(-25) } })

    const taskTags = await Promise.all(TASK_TAGS.map(tag => tx.tag.create({ data: { userId: people.owner, name: tag[lang], color: tag.color } })))
    for (const task of TASKS) {
      await tx.task.create({
        data: {
          userId: people[task.who ?? 'owner'],
          title: task.title[lang],
          priority: task.priority ?? 'NONE',
          dueDate: task.due === null ? null : dayOffset(task.due),
          done: task.done ?? false,
          doneAt: task.done ? dayOffset(task.due ?? 0) : null,
          ...(task.tag !== undefined && task.who === undefined && { tags: { create: { tagId: taskTags[task.tag]!.id } } })
        }
      })
    }

    for (const [index, habit] of HABITS.entries()) {
      const created = await tx.habit.create({
        data: { userId: people.owner, name: habit.name[lang], icon: habit.icon, color: habit.color, perWeek: habit.perWeek, sortOrder: index, createdAt: dayOffset(-40) }
      })
      const marks = []
      for (let offset = -40; offset < 0; offset++) {
        if (next() < habit.chance) marks.push({ habitId: created.id, date: dayOffset(offset) })
      }
      await tx.habitMark.createMany({ data: marks })
    }
  }, { timeout: 60_000 })

  return { email: DEMO_EMAILS.owner, password }
}
