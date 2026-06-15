import process from 'node:process'
import { $fetch } from '@nuxt/test-utils/e2e'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/.generated/prisma/index.js'

// Отдельный prisma-клиент тестового процесса (не серверный синглтон) —
// для проверки записей напрямую в БД и очистки между тестами.
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

// TRUNCATE ... CASCADE с User вычищает все зависимые таблицы по FK,
// RESTART IDENTITY сбрасывает счётчики. Дёшево и без порядка удаления.
export async function resetDb() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
}

interface RegisteredUser {
  token: string
  userId: string
  email: string
}

let counter = 0

// Регистрирует пользователя через реальный эндпоинт и возвращает токен.
// Так же сервер сидирует 10 категорий — естественная точка для тестов.
export async function registerUser(): Promise<RegisteredUser> {
  counter += 1
  const email = `user${counter}-${Date.now()}@test.local`
  const res = await $fetch<{ accessToken: string, user: { id: string } }>('/api/auth/register', {
    method: 'POST',
    // Уникальный X-Forwarded-For на каждого — rate limiter ключует бакет по IP,
    // иначе 10 регистраций исчерпают лимит в пределах одного прогона.
    headers: { 'x-forwarded-for': `10.0.${Math.floor(counter / 250)}.${counter % 250}` },
    body: { name: 'Test User', email, password: 'password123' }
  })
  return { token: res.accessToken, userId: res.user.id, email }
}

// Шорткат для авторизованного запроса.
export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}
