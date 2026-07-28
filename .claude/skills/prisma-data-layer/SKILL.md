---
name: prisma-data-layer
description: Паттерны работы с Prisma в проекте MyDay — singleton клиента при hot reload, сидирование категорий при регистрации, конвертация Decimal в number перед отдачей клиенту, нормализация вложенных структур из join-таблиц (теги). Используй при написании Prisma-запросов, mapper-функций или seed-логики.
---

# Prisma Data Layer Patterns — MyDay

## Prisma singleton (горячая перезагрузка)

В dev-режиме Nitro делает hot reload. Без singleton каждый перезапуск создаёт новый `PrismaClient` и новый connection pool → "too many connections" через несколько минут.

```ts
// server/utils/prisma.ts — импорт из prisma/.generated (кастомный output), НЕ из @prisma/client
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/prisma/.generated/prisma'

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const globalWithPrisma = globalThis as typeof globalThis & { prisma?: ReturnType<typeof createPrismaClient> }
const prisma = globalWithPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalWithPrisma.prisma = prisma

export default prisma
```

---

## Сидирование категорий при регистрации

При создании пользователя всегда вызывать `seedCategories(userId)` из `prisma/seeds/categories.ts`. Не делать это отдельным шагом — иначе пользователь может существовать без категорий. С шага 4.5.0 сид включает две системные категории «Другое» (EXPENSE и INCOME, `isSystem: true`) — на них переназначаются транзакции при удалении обычной категории.

```ts
// server/api/auth/register.post.ts
const user = await prisma.user.create({ ... })
await prisma.appSettings.create({ data: { userId: user.id } })
await seedCategories(user.id) // всегда в рамках одной транзакции (prisma.$transaction)
```

---

## Decimal из Prisma на клиенте

Prisma возвращает `amount` как объект `Decimal`, не `number`. При сериализации в JSON он превращается в строку. В API handler нужно явно конвертировать перед отдачей:

```ts
// Либо через toNumber() в mapper-функции
const mapped = transactions.map(tx => ({
  ...tx,
  amount: tx.amount.toNumber(),
}))
```

Или настроить кастомный JSON serializer в Nitro. Не открывай Prisma-объект напрямую в клиентском коде.

---

## Нормализация тегов из Prisma

Запрос с include через join table возвращает вложенную структуру. Сразу нормализуй в mapper:

```ts
// Prisma возвращает: task.tags = [{ taskId, tagId, tag: { id, name, color } }]
// Нужно:            task.tags = [{ id, name, color }]

function normalizeTask(task: TaskWithTags) {
  return {
    ...task,
    tags: task.tags.map(tt => tt.tag),
  }
}
```

Делай это на сервере перед отдачей клиенту — клиент не должен знать о структуре join table.
