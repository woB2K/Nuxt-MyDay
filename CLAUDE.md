# CLAUDE.md — MyDay Project Guide

## Описание проекта

**MyDay** — комбинированное приложение: управление задачами + личные финансы.

**Стек:** Nuxt 4 + Vue 3, PostgreSQL + Prisma, Tailwind CSS, Pinia + TanStack Query, Zod, OAuth 2 (Google) + JWT (access/refresh), PWA, GitHub Actions.

**Дизайн:** мобильный (390×844), iOS-inspired, dark-first с поддержкой светлой темы. Дизайн-токены и компоненты описаны в `DESIGN.md`.

---

## Правила работы (обязательно прочти)

Я учусь — ты помогаешь мне расти, а не пишешь за меня.

1. **Не пиши код без моей явной просьбы.** Если я описываю задачу — объясни подход, паттерн, подводные камни. Жди пока я напишу сам.
2. **Когда я показываю свой код — критикуй честно.** Объясни что плохо и почему, покажи как правильно.
3. **Указывай на junior-антипаттерны** даже если мой вариант "работает".
4. **Называй trade-offs** у каждого решения.
5. **Не соглашайся** если я предлагаю плохое решение. Скажи прямо: "это плохая идея потому что X, лучше Y".
6. **Используй примеры из этого проекта**, не абстрактные.
7. **Объясняй "почему"**, а не только "что".

**Исключение — тесты:** тесты пишу я (Claude). После написания кратко объясняю что проверяет каждый тест и почему именно так. Цель — показать как работает тестирование на реальном коде проекта.

---

## Пакетный менеджер

Везде используем **только pnpm**. Никаких npm или yarn.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

---

## Файловая структура

```
myday/
├── app/                              # весь клиентский код (Nuxt 4)
│   ├── app.vue
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── ui/                       # UiButton, UiInput, UiCard...
│   │   └── features/
│   │       ├── auth/
│   │       ├── tasks/
│   │       ├── finance/
│   │       └── settings/
│   ├── composables/
│   │   ├── queryKeys.ts              # централизованные ключи TanStack Query
│   │   ├── useAuth.ts
│   │   ├── useFinance.ts             # TanStack Query хуки: транзакции, summary, savings, budgets
│   │   ├── useCategories.ts          # TanStack Query хуки: CRUD категорий (finance + settings)
│   │   ├── useTasks.ts               # TanStack Query хуки: задачи, теги, шаблоны
│   │   └── useToast.ts
│   ├── plugins/
│   │   └── vue-query.ts              # VueQueryPlugin + QueryClient настройка
│   ├── layouts/
│   │   ├── default.vue               # TabBar + FAB
│   │   └── auth.vue                  # чистый layout
│   ├── middleware/
│   │   ├── auth.ts                   # редирект → /auth/welcome если нет токена
│   │   └── guest.ts                  # редирект → /today если уже залогинен
│   ├── pages/
│   │   ├── index.vue                 # redirect → /today
│   │   ├── auth/
│   │   │   ├── welcome.vue
│   │   │   ├── login.vue
│   │   │   └── register.vue
│   │   ├── today.vue
│   │   ├── tasks/
│   │   │   ├── index.vue
│   │   │   └── templates.vue
│   │   ├── finance/
│   │   │   └── index.vue
│   │   ├── settings.vue
│   │   └── settings/
│   │       └── categories.vue
│   └── stores/
│       ├── auth.ts                   # useAuthStore — accessToken, user
│       ├── tasks.ts                  # useTasksStore — searchQuery, activeFilter (client state only)
│       ├── finance.ts                # useFinanceStore — currentMonth, activeTab (client state only)
│       └── ui.ts                     # useUiStore — тосты, isLocked
│
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.post.ts
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   ├── refresh.post.ts
│   │   │   └── oauth/
│   │   │       ├── google.get.ts
│   │   │       └── google.callback.get.ts
│   │   ├── tasks/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].patch.ts
│   │   │   └── [id].delete.ts
│   │   ├── templates/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].patch.ts
│   │   │   └── [id].delete.ts
│   │   ├── tags/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].patch.ts
│   │   │   └── [id].delete.ts
│   │   ├── finance/
│   │   │   ├── transactions/
│   │   │   │   ├── index.get.ts
│   │   │   │   ├── index.post.ts
│   │   │   │   ├── [id].patch.ts
│   │   │   │   └── [id].delete.ts
│   │   │   ├── summary.get.ts
│   │   │   ├── savings/
│   │   │   │   ├── index.get.ts
│   │   │   │   ├── index.post.ts
│   │   │   │   └── [id].delete.ts
│   │   │   └── budgets/
│   │   │       ├── index.get.ts
│   │   │       └── index.post.ts
│   │   ├── categories/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].patch.ts
│   │   │   └── [id].delete.ts
│   │   └── users/
│   │       └── me.get.ts
│   ├── middleware/
│   │   └── 01.auth.ts                # JWT валидация (нумерация = порядок)
│   └── utils/
│       ├── jwt.ts
│       ├── password.ts
│       └── prisma.ts                 # Prisma singleton
│
├── shared/                           # изоморфный слой (client + server)
│   ├── types/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── finance.ts
│   │   └── api.ts                    # PaginatedResponse<T>
│   └── schemas/                      # Zod — одна схема для клиента и сервера
│       ├── auth.ts
│       ├── tasks.ts
│       └── finance.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seeds/
│       ├── categories.ts
│       └── users.ts
│
├── public/
│   ├── icons/
│   └── manifest.webmanifest
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── i18n/
│   └── locales/
│       ├── en.json                       # английские строки
│       └── ru.json                       # русские строки
│
├── .env.example
├── nuxt.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── CLAUDE.md
└── DESIGN.md
```

---

## Соглашения

### Именование файлов
| Тип | Соглашение | Пример |
|-----|-----------|--------|
| Vue компоненты | PascalCase | `UiButton.vue`, `TaskRow.vue` |
| Composables | camelCase с `use` | `useAuth.ts` |
| Stores | camelCase | `auth.ts` → экспорт `useAuthStore` |
| Серверные утилиты | camelCase | `jwt.ts`, `password.ts` |
| Типы / схемы | camelCase | `tasks.ts` |
| API роуты | Nuxt конвенция | `[id].patch.ts` |

### Именование компонентов
- `Ui*` — переиспользуемые базовые компоненты без бизнес-логики
- Всё остальное — по смыслу без префикса: `TaskRow.vue`, `FocusCard.vue`

### API endpoints
```
GET    /api/tasks           список
POST   /api/tasks           создать
PATCH  /api/tasks/:id       обновить (partial)
DELETE /api/tasks/:id       удалить
GET    /api/finance/summary агрегация (не CRUD)
```

### Разделение состояния: Pinia vs TanStack Query

Ключевое архитектурное решение проекта — два типа состояния живут раздельно:

| Тип | Инструмент | Примеры |
|-----|-----------|---------|
| **Client state** — данные которыми владеет UI | Pinia | `accessToken`, `isLocked`, `toasts`, `currentMonth`, `activeFilter`, `searchQuery` |
| **Server state** — данные с API, кэшируемые | TanStack Query | `transactions`, `summary`, `savings`, `tasks`, `categories`, `tags` |

**Правило:** компоненты вызывают TanStack Query хуки напрямую из `composables/useFinance.ts` и `composables/useTasks.ts`. Pinia-сторы НЕ содержат серверные данные и НЕ вызывают TanStack Query.

### Pinia stores
```ts
// Всегда composable-стиль, не options-стиль
export const useFinanceStore = defineStore('finance', () => {
  // ТОЛЬКО client state — UI-фильтры, не данные с сервера
  const currentMonth = ref('2026-05')
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')
  return { currentMonth, activeTab }
})
```

### Prisma модели
- PascalCase singular: `User`, `Task`, `Transaction`
- Поля: camelCase: `createdAt`, `passwordHash`
- Enums: SCREAMING_SNAKE_CASE значения: `INCOME`, `EXPENSE`

### Zod схемы
```ts
// shared/schemas/tasks.ts — одна схема, два использования
export const createTaskSchema = z.object({ ... })
export type CreateTaskInput = z.infer<typeof createTaskSchema>
```

### i18n

Используем `@nuxtjs/i18n` (v10). Два языка: `en` (default) и `ru`. Файлы переводов: `i18n/locales/en.json` и `i18n/locales/ru.json`.

**Правило: любой текст видимый пользователю — только через `t()`. Никакого хардкода строк в шаблонах.**

```vue
<script setup>
const { t } = useI18n()  // обязательно в каждом компоненте с текстом
</script>

<template>
  <p>{{ t('welcome.tagline') }}</p>
</template>
```

**Структура ключей — nested по странице/фиче:**
```json
{
  "welcome": { "tagline": "Tasks & finances, one place" },
  "auth": { "signIn": "Sign in", "register": "Create account" },
  "tasks": { "empty": "No tasks yet", "add": "Add task" }
}
```

**При вёрстке любого компонента с текстом:**
1. Добавить ключи в `i18n/locales/en.json`
2. Добавить переводы в `i18n/locales/ru.json`
3. Использовать `t('key')` в шаблоне

Переключение локали: `const { locale } = useI18n(); locale.value = 'ru'`. Сохранять выбор в `AppSettings` и синхронизировать при старте приложения.

### Ответы сервера
```ts
// Успех простой    → return data напрямую
// Успех пагинация → return paginated(data, total, page, perPage)
// Ошибка          → throw createError({ statusCode, message })
```

---

## Запуск локально

```bash
# Установка зависимостей
pnpm install

# Сгенерировать Prisma Client
pnpm prisma generate

# Применить миграции
pnpm prisma migrate dev

# Сидировать БД
pnpm prisma db seed

# Dev сервер
pnpm dev

# Тесты (unit + store)
pnpm test

# Тесты с покрытием
pnpm test:coverage

# E2E тесты (Playwright)
pnpm test:e2e

# E2E с UI (удобно при разработке)
pnpm test:e2e --ui
```

Необходимые переменные окружения (скопируй `.env.example` → `.env`):

```env
DATABASE_URL=postgresql://user:password@host:5432/myday
JWT_ACCESS_SECRET=минимум-32-символа
JWT_REFRESH_SECRET=другой-секрет-минимум-32-символа
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Миграции Prisma

```bash
# Создать и применить новую миграцию
pnpm prisma migrate dev --name describe_what_changed

# Применить миграции на проде (без интерактивного режима)
pnpm prisma migrate deploy

# Посмотреть БД в браузере
pnpm prisma studio
```

**Правило:** никогда не редактируй файлы в `prisma/migrations/` вручную. Если нужно изменить схему — меняй `schema.prisma`, создавай новую миграцию.

---

## Архитектура БД

### Ключевые решения

| Решение | Почему |
|---------|--------|
| Hard delete везде | Проект личный, нет нужды в восстановлении удалённых данных |
| `Decimal(12,2)` для денег | Float накапливает ошибки (`0.1 + 0.2 ≠ 0.3`) при агрегации |
| `date` + `createdAt` в Transaction | `date` — когда произошла транзакция (user sets), `createdAt` — когда создана запись. Фильтрация по месяцу всегда по `date` |
| Категории per-user, сидируются при регистрации | Нет nullable userId, каждый владеет своими категориями, может удалять любые |
| Tags — отдельная таблица many-to-many | Тег — сущность: можно переименовать, добавить цвет, считать статистику. `Tag.color` nullable — до появления UI цвета старые теги не ломаются |
| `SavingsEntry` отдельно от `Transaction` | Накопительный счёт не пересекается с основными финансами. Отдельная таблица = чистые запросы. `SavingsEntry` имеет `type: SavingsType (DEPOSIT \| WITHDRAWAL)` и всегда положительный `amount`. Баланс = `SUM(DEPOSIT) - SUM(WITHDRAWAL)`. Это позволяет и пополнять, и снимать с накоплений |
| Баланс накоплений — всегда total, не по месяцу | Накопления накопительные по природе: если отложил 10к в январе и 5к в феврале — итого 15к, а не 5к. Фильтр по месяцу применяется только к истории записей, не к балансу. `GET /api/finance/savings` возвращает `{ balance, entries }` где `balance` = SUM за всё время |
| `RefreshToken` в БД с bcrypt-хешем | Инвалидация токенов при logout/смене пароля. Хеш — если БД утечёт, сырые токены не скомпрометированы |
| `shared/` для типов и Zod | Единственный способ шарить код между client и server в Nuxt без хаков |
| Агрегация finance на сервере | SQL SUM/GROUP BY быстрее чем JS reduce на 500 записях |
| PIN — UI lock, не второй фактор | Пользователь аутентифицирован, PIN только блокирует интерфейс. Хеш в `AppSettings`, валидация на клиенте без сетевого запроса. Сброс — через провайдера регистрации (Google re-auth или пароль аккаунта) |

### Диаграмма связей

```mermaid
erDiagram
    User ||--o{ OAuthAccount : "has"
    User ||--o{ RefreshToken : "has"
    User ||--|| AppSettings : "has"
    User ||--o{ Task : "owns"
    User ||--o{ TaskTemplate : "owns"
    User ||--o{ Tag : "owns"
    User ||--o{ Transaction : "owns"
    User ||--o{ SavingsEntry : "owns"
    User ||--o{ Category : "owns"
    User ||--o{ Budget : "owns"

    Task ||--o{ TaskTag : "has"
    Tag  ||--o{ TaskTag : "used in"

    TaskTemplate ||--o{ TaskTemplateTag : "has"
    Tag          ||--o{ TaskTemplateTag : "used in"

    Transaction ||--|| Category : "belongs to"
    Budget      ||--|| Category : "for"
```

### Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database
    participant G as Google

    Note over C,G: Email/Password регистрация
    C->>S: POST /api/auth/register {name, email, password}
    S->>S: Zod validation
    S->>DB: Create User + AppSettings + seed Categories
    S->>DB: Create RefreshToken (hashed)
    S-->>C: {accessToken} + Set-Cookie: refreshToken (httpOnly)

    Note over C,G: Google OAuth
    C->>S: GET /api/auth/oauth/google
    S-->>C: redirect → Google consent
    C->>G: user consents
    G-->>S: GET /callback?code=xxx
    S->>G: exchange code → tokens + profile
    S->>DB: Upsert User + OAuthAccount
    S-->>C: {accessToken} + Set-Cookie: refreshToken

    Note over C,S: Защищённый запрос
    C->>S: GET /api/tasks + Authorization: Bearer <accessToken>
    S->>S: middleware/01.auth.ts verifies JWT
    S-->>C: tasks data

    Note over C,S: Token refresh (автоматически при 401)
    C->>S: POST /api/auth/refresh (cookie отправляется браузером)
    S->>DB: find RefreshToken by hash, check expiresAt
    S->>DB: rotate — delete old, create new
    S-->>C: {accessToken} + новый refreshToken cookie

    Note over C,S: Logout
    C->>S: POST /api/auth/logout
    S->>DB: delete RefreshToken
    S-->>C: Set-Cookie: refreshToken=; Max-Age=0
```

### Зоны риска — нельзя менять без рефакторинга

| Решение | Что сломается при изменении |
|---------|----------------------------|
| `Decimal` для `amount` | Все агрегации, сравнения, отображение |
| `date` поле в Transaction | Вся фильтрация по месяцу/периоду |
| `userId` в каждом WHERE | Утечка данных между пользователями (security) |
| `shared/` для типов и схем | Дублирование валидации или импорт-хаки |
| httpOnly cookie для refreshToken | XSS-уязвимость если переехать в localStorage |
| Per-user категории (сид при регистрации) | Data migration + изменение всех запросов |
| `SavingsEntry` отдельно от `Transaction` | Data migration если объединить |
| Нумерация middleware (`01.auth.ts`) | Порядок выполнения в Nitro |

---

## Важные паттерны

### Silent refresh при старте приложения

При F5 access token из Pinia исчезает. `app.vue` вызывает `authStore.init()` при монтировании — пробует обновить токен через httpOnly cookie. Пользователь не видит экрана логина если refresh token ещё валиден.

```ts
// app/stores/auth.ts
async function init() {
  try {
    await refresh() // POST /api/auth/refresh, cookie отправляется автоматически
  } catch {
    accessToken.value = null // cookie нет или истёк → пользователь разлогинен
  }
}
```

```vue
<!-- app/app.vue -->
<script setup>
const authStore = useAuthStore()
await authStore.init() // блокирует рендер до получения статуса auth
</script>
```

### Prisma singleton (горячая перезагрузка)

В dev-режиме Nitro делает hot reload. Без singleton каждый перезапуск создаёт новый `PrismaClient` и новый connection pool → "too many connections" через несколько минут.

```ts
// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Сидирование категорий при регистрации

При создании пользователя всегда вызывать `seedCategories(userId)` из `prisma/seeds/categories.ts`. Не делать это отдельным шагом — иначе пользователь может существовать без категорий.

```ts
// server/api/auth/register.post.ts
const user = await prisma.user.create({ ... })
await prisma.appSettings.create({ data: { userId: user.id } })
await seedCategories(user.id) // всегда в рамках одной транзакции (prisma.$transaction)
```

### Оптимистичные апдейты в Pinia

Паттерн: сохранить предыдущее состояние → обновить UI → сделать запрос → откатить при ошибке.

```ts
async function toggleTask(id: string) {
  const task = tasks.value.find(t => t.id === id)!
  const prev = task.done                    // 1. сохранить
  task.done = !task.done                    // 2. обновить UI немедленно
  try {
    await $fetch(`/api/tasks/${id}`, { method: 'PATCH', body: { done: task.done } })
  } catch {
    task.done = prev                        // 3. откатить при ошибке
    useToast().error('Failed to update')
  }
}
```

### Переключение темы

CSS-переменные переключаются через класс `.dark` на `<html>`. Tailwind `darkMode: 'class'`.

```ts
// app/composables/useTheme.ts
export function useTheme() {
  const settings = useSettingsStore()

  function apply(theme: 'dark' | 'light' | 'system') {
    const isDark = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  }

  watch(() => settings.theme, apply, { immediate: true })
  // При system: слушать prefers-color-scheme mediaQuery на изменения
}
```

### Decimal из Prisma на клиенте

Prisma возвращает `amount` как объект `Decimal`, не `number`. При сериализации в JSON он превращается в строку. В API handler нужно явно конвертировать перед отдачей:

```ts
// Либо через toNumber() в mapper-функции
const mapped = transactions.map(tx => ({
  ...tx,
  amount: tx.amount.toNumber(),
}))
```

Или настроить кастомный JSON serializer в Nitro. Не открывай Prisma-объект напрямую в клиентском коде.

### Нормализация тегов из Prisma

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

### PIN блокировка (useAppLock)

PIN — это UI lock поверх уже существующей авторизации. Хеш PIN загружается в Pinia после логина и хранится в памяти.

```ts
// app/composables/useAppLock.ts
export function useAppLock() {
  const ui = useUiStore()
  const settings = useSettingsStore()
  let lockTimer: ReturnType<typeof setTimeout>

  function resetTimer() {
    clearTimeout(lockTimer)
    if (settings.pinEnabled) {
      lockTimer = setTimeout(() => { ui.isLocked = true }, 5 * 60 * 1000)
    }
  }

  // Блокировать при уходе из приложения
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(lockTimer)
    else if (settings.pinEnabled) ui.isLocked = true
  })

  // Сбросить таймер на любом действии пользователя
  document.addEventListener('pointerdown', resetTimer)
}

// Сброс PIN — определяем провайдера:
// user.oauthAccounts.length > 0 → Google re-auth
// user.passwordHash !== null     → ввод пароля
// После успешной верификации:
// PATCH /api/users/me/settings { pinEnabled: false, pinHash: null }
```

Маршрут `/auth/pin` защищён обратной логикой: показывается только если `isAuthenticated && isLocked`. Обычный `auth` middleware пропускает залогиненных пользователей дальше, отдельный `pinLock` middleware проверяет `isLocked`.

### Rate limiting (server/middleware/02.rateLimit.ts)

Защита от брутфорса на auth endpoints. Хранит счётчики попыток в памяти (Map). На проде — заменить на Redis через `unstorage`.

```ts
const attempts = new Map<string, { count: number; resetAt: number }>()

// Применяется только к /api/auth/login и /api/auth/register
// При превышении → throw createError({ statusCode: 429, message: 'Too many requests' })
```

### Глобальный обработчик ошибок

`useToast` — composable для показа уведомлений. Очередь тостов живёт в `useUiStore`. `UiToast` компонент рендерится в `app.vue`.

```ts
// Использование в store при откате оптимистичного апдейта:
const { error } = useToast()
error('Failed to save task')

// Nuxt hook для непойманных ошибок:
// app/plugins/errorHandler.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err) => {
    useToast().error(err.message ?? 'Something went wrong')
  })
})
```

### useApi — авторизованные запросы с клиента

Все клиентские запросы к защищённым эндпоинтам идут через `useApi()`, а не через `$fetch` напрямую. Composable создаёт `$fetch` инстанс с `onRequest` interceptor, который подставляет `Authorization: Bearer <token>` из `useAuthStore`.

```ts
// app/composables/useApi.ts
export function useApi() {
  const authStore = useAuthStore()
  return $fetch.create({
    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    }
  })
}
```

**Исключение — `useAuthStore`**: он работает с `$fetch` напрямую, иначе circular dependency (`useApi` → `useAuthStore` → `useApi`).

Создать `useApi` перед написанием первого стора который делает защищённые запросы (tasks, finance).

---

### TanStack Query — server state

Устанавливается через `@tanstack/vue-query`. Это Vue-адаптация — та же библиотека что TanStack Query для React, но с Vue Composition API.

#### Настройка плагина

```ts
// app/plugins/vue-query.ts
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,  // данные свежие 5 минут — не рефетчить без нужды
        retry: 1,                   // 1 повтор при ошибке сети
      }
    }
  })
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
```

#### Query Keys — централизованный файл

Ключи — это идентификаторы кэша. Иерархические: `['transactions']` инвалидирует всё включая `['transactions', { month }]`. Хранить в одном месте чтобы не опечататься.

```ts
// app/composables/queryKeys.ts
export const queryKeys = {
  categories:   ()                           => ['categories']              as const,
  transactions: (month: string)              => ['transactions', { month }] as const,
  summary:      (month: string)              => ['summary', { month }]      as const,
  savings:      ()                           => ['savings']                 as const,
  budgets:      (month: string)              => ['budgets', { month }]      as const,
  tasks:        (filter: string, search: string) => ['tasks', { filter, search }] as const,
  tags:         ()                           => ['tags']                    as const,
  templates:    ()                           => ['templates']               as const,
}
```

#### useQuery — чтение данных

```ts
// app/composables/useFinance.ts
export function useTransactionsQuery(month: Ref<string>) {
  const api = useApi()
  return useQuery({
    queryKey: computed(() => queryKeys.transactions(month.value)), // реактивный ключ
    queryFn:  () => api<PaginatedResponse<Transaction>>('/api/finance/transactions', {
      query: { month: month.value }
    }),
  })
}
```

В компоненте:
```ts
const financeStore = useFinanceStore()
const { data, isPending, isError } = useTransactionsQuery(
  toRef(financeStore, 'currentMonth')
)
// При financeStore.currentMonth = '2026-04' → новый запрос автоматически
// Старый результат закэширован — возврат к месяцу = мгновенный ответ
```

#### useMutation — мутации с инвалидацией кэша

```ts
export function useAddTransactionMutation() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      api<Transaction>('/api/finance/transactions', { method: 'POST', body: data }),
    onSuccess: () => {
      // Инвалидируем все затронутые ресурсы — они перезапросятся автоматически
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      // Не нужно вручную пушить в массив или вызывать fetchSummary()
    },
    onError: () => useToast().error('Failed to add transaction'),
  })
}
```

#### Оптимистичный апдейт через TanStack Query

Встроенный механизм лучше Pinia-паттерна "сохранить/откатить":

```ts
export function useDeleteTransactionMutation(month: Ref<string>) {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/finance/transactions/${id}`, { method: 'DELETE' }),

    onMutate: async (id) => {
      // Отменить незавершённые запросы чтобы они не перезаписали оптимистичный апдейт
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions(month.value) })
      // Сохранить текущий кэш для отката
      const previous = queryClient.getQueryData(queryKeys.transactions(month.value))
      // Обновить кэш немедленно — UI реагирует до ответа сервера
      queryClient.setQueryData(queryKeys.transactions(month.value), (old: any) =>
        old?.data?.filter((tx: Transaction) => tx.id !== id)
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      // Откатить к сохранённому состоянию
      queryClient.setQueryData(queryKeys.transactions(month.value), context?.previous)
      useToast().error('Failed to delete transaction')
    },
    onSettled: () => {
      // После успеха ИЛИ ошибки — синхронизировать с сервером
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
```

#### Структура composables с TanStack Query

```ts
// app/composables/useFinance.ts — все хуки для finance
export function useTransactionsQuery(month: Ref<string>) { ... }
export function useSummaryQuery(month: Ref<string>) { ... }
export function useSavingsQuery() { ... }
export function useBudgetsQuery(month: Ref<string>) { ... }
export function useAddTransactionMutation() { ... }
export function useUpdateTransactionMutation() { ... }
export function useDeleteTransactionMutation(month: Ref<string>) { ... }
export function useAddSavingsMutation() { ... }
export function useDeleteSavingsMutation() { ... }
export function useUpsertBudgetMutation() { ... }

// app/composables/useCategories.ts — отдельно, используется в Finance И Settings
export function useCategoriesQuery() { ... }
export function useAddCategoryMutation() { ... }
export function useUpdateCategoryMutation() { ... }
export function useDeleteCategoryMutation() { ... }

// app/composables/useTasks.ts — все хуки для tasks
export function useTasksQuery(filter: Ref<string>, search: Ref<string>) { ... }
export function useTagsQuery() { ... }
export function useTemplatesQuery() { ... }
export function useAddTaskMutation() { ... }
export function useToggleTaskMutation() { ... }
export function useDeleteTaskMutation() { ... }
```

---

### Безопасность: userId всегда из контекста

`userId` всегда берётся из JWT (через `event.context.userId`), никогда из query/body запроса.

```ts
// ❌ Никогда так
const { userId } = await readBody(event)

// ✅ Всегда так
const userId = event.context.userId // проставляет server/middleware/01.auth.ts
```

Иначе любой аутентифицированный пользователь может передать чужой `userId` и получить доступ к чужим данным.

---

## Фазы реализации

Чтобы начать сессию — скажи "приступаем к шагу N". Чтобы завершить шаг — напиши "Идем дальше": Claude отмечает текущий шаг `[x]` и предлагает следующий.

---

### Фаза 0 — Фундамент

- [x] **0.1** Создать Nuxt 4 проект: `pnpm dlx nuxi@latest init myday`, выбрать `ui` template
- [x] **0.2** Настроить `nuxt.config.ts`: `compatibilityVersion: 4`, `ssr: false` (SPA режим — все страницы за авторизацией, SSR не нужен), модули (`@pinia/nuxt`, `@vite-pwa/nuxt`), `runtimeConfig` с секретами
- [x] **0.3** Установить и настроить Tailwind: скопировать `tailwind.config.js` из `design_handoff_myday/`, подключить CSS-переменные тем в `assets/css/main.css`
- [x] **0.4** Настроить Pinia: проверить auto-import, создать структуру `stores/`
- [x] **0.5** Инициализировать Prisma: `pnpm prisma init`, скопировать схему из `CLAUDE.md`, запустить первую миграцию `pnpm prisma migrate dev --name init`
- [x] **0.6** Создать `server/utils/prisma.ts` (singleton паттерн)
- [x] **0.7** Создать `.env.example`, подключиться к удалённой БД, проверить `pnpm prisma studio`
- [x] **0.8** Создать структуру `shared/types/` и `shared/schemas/` с базовыми Zod-схемами (auth, tasks, finance)
- [x] **0.9** *(Claude пишет)* Настроить тестовое окружение: установить `vitest`, `@nuxt/test-utils`, `@vue/test-utils`, `playwright`; создать `vitest.config.ts` и `playwright.config.ts`

---

### Фаза 1 — Auth & Shell

**Сервер (делать в этом порядке, проверять через curl/Postman):**

- [x] **1.1** `server/utils/jwt.ts` — функции `signAccessToken`, `signRefreshToken`, `verifyToken`
- [x] **1.2** `server/utils/password.ts` — `hashPassword`, `comparePassword` (bcrypt, cost 12)
- [x] **1.3** `server/middleware/01.auth.ts` — извлечение и верификация Bearer токена, запись `event.context.userId`
- [x] **1.4** `POST /api/auth/register` — валидация Zod, создание User + AppSettings + seed Categories (в `prisma.$transaction`)
- [x] **1.5** `POST /api/auth/login` — поиск по email, bcrypt.compare, выдача токенов
- [x] **1.6** `POST /api/auth/logout` — удаление RefreshToken из БД, очистка cookie
- [x] **1.7** `POST /api/auth/refresh` — ротация refresh токена, выдача нового access токена
- [ ] **1.8** `GET /api/auth/oauth/google` + `GET /api/auth/oauth/google/callback` — Google OAuth flow
- [x] **1.9** `GET /api/users/me` — возврат профиля текущего пользователя

**Клиент:**

- [x] **1.10** `stores/auth.ts` — `useAuthStore` с `accessToken`, `user`, `init()`, `refresh()`, `logout()`
- [x] **1.11** `app/middleware/auth.ts` и `guest.ts`
- [x] **1.12** `layouts/auth.vue` — чистый layout без навигации
- [x] **1.13** `pages/auth/welcome.vue` — Welcome screen с Google OAuth + email кнопками
- [x] **1.14** Все `components/ui/` базовые компоненты: `UiButton`, `UiInput`, `UiCard`, `UiBadge`, `UiPillSelect`, `UiSwitch`, `UiCheckCircle`, `UiLogoMark`
- [x] **1.15** Все `components/ui/` лэйаутные: `UiTabBar`, `UiFab`, `UiEmptyState`, `UiSectionHeader`, `UiSheet`
- [x] **1.16** `pages/auth/login.vue` — форма Sign In (переписать с `UiButton`, `UiInput`)
- [x] **1.17** `pages/auth/register.vue` — форма Create Account
- [x] **1.18** `layouts/default.vue` — TabBar + FAB (использует `UiTabBar`, `UiFab`)
- [x] **1.19** *(Claude пишет)* Unit тесты для `jwt.ts` — sign/verify roundtrip, истёкший токен, невалидная подпись
- [x] **1.20** *(Claude пишет)* Unit тесты для `password.ts` — hash/compare, неверный пароль
- [x] **1.21** *(Claude пишет)* Unit тесты для Zod-схем auth — граничные случаи: пустой email, короткий пароль, лишние поля
- [x] **1.22** *(Claude пишет)* Store тесты для `useAuthStore` — `init()` при валидном cookie, `init()` при истёкшем cookie, `logout()` очищает состояние
- [x] **1.23** `server/middleware/02.rateLimit.ts` — rate limiting на auth endpoints (`/api/auth/login`, `/api/auth/register`): максимум 10 попыток за 15 минут с одного IP, ответ `429 Too Many Requests`
- [x] **1.24** `composables/useToast.ts` + глобальный обработчик ошибок — toast-очередь в `useUiStore`, Nuxt `app:error` hook для непойманных ошибок, компонент `UiToast`

---

### Фаза 2 — Finance Core

**Сервер:**

- [x] **2.1** `prisma/seeds/categories.ts` — seed-функция стандартных категорий (10 штук из дизайна)
- [x] **2.2** `GET/POST /api/categories` + `PATCH/DELETE /api/categories/[id]`
- [x] **2.3** `GET/POST /api/finance/transactions` + `PATCH/DELETE /api/finance/transactions/[id]` (с пагинацией)
- [x] **2.4** `GET /api/finance/summary` — агрегация SQL: income, expense, net, breakdown by category
- [x] **2.5** `GET/POST/DELETE /api/finance/savings` — операции накопительного счёта
- [x] **2.6** `GET/POST/PATCH /api/finance/budgets` — бюджеты по категориям

**Клиент:**

- [x] **2.7** `composables/useApi.ts` — `$fetch.create()` с `onRequest` interceptor для подстановки `Authorization: Bearer` из `useAuthStore`. Создать до всех защищённых запросов.
- [x] **2.7.5** Установить `@tanstack/vue-query`, создать `plugins/vue-query.ts` (QueryClient с staleTime 5 мин), создать `composables/queryKeys.ts` с централизованными ключами
- [x] **2.8** `stores/finance.ts` — `useFinanceStore` (Pinia, **только client state**: `currentMonth`, `activeTab`). Серверные данные — НЕ здесь.
- [x] **2.8.5** `composables/useFinance.ts` — все TanStack Query хуки: `useTransactionsQuery`, `useSummaryQuery`, `useSavingsQuery`, `useBudgetsQuery` + мутации с `invalidateQueries`
- [x] **2.8.6** `composables/useCategories.ts` — TanStack Query хуки для CRUD категорий (используется и в Finance и в Settings)
- [x] **2.9** `components/ui/UiTxRow`, `UiCategoryTile`, `UiCategoryBar`
- [x] **2.10** `pages/finance/index.vue` — hero баланс (всегда) + `UiPillSelect` для переключения табов + `components/features/finance/FinanceTransactionsTab.vue` (breakdown + recent). Структура: hero → pill tabs → контент таба. `financeStore.activeTab` управляет видимостью табов.
- [x] **2.11** `components/features/finance/AddTransactionSheet.vue` — тип + сумма + категория + заметка
- [x] **2.12** `components/features/finance/FinanceSavingsTab.vue` — раздел Savings (таб внутри Finance страницы)
- [ ] **2.13** `components/features/finance/FinanceBudgetsTab.vue` — раздел Budgets (таб внутри Finance страницы, карточки с прогресс-баром)
- [ ] **2.14** Управление категориями в Settings (список + создать/редактировать/удалить)
- [ ] **2.15** *(Claude пишет)* Unit тесты для Zod-схем finance — невалидная сумма (отрицательная, строка), неизвестная категория
- [ ] **2.15.5** *(Claude пишет)* Интеграционные тесты для API эндпоинтов Фазы 2 (через `@nuxt/test-utils`, тестовая БД): `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`, `GET/POST /api/finance/transactions`, `PATCH/DELETE /api/finance/transactions/[id]`, `GET /api/finance/summary`, `GET/POST/DELETE /api/finance/savings`, `GET/POST/PATCH /api/finance/budgets` — проверить: `userId` изоляция (нельзя получить чужие данные), валидация входных данных, корректность агрегации в summary
- [ ] **2.16** *(Claude пишет)* Тесты для TanStack Query хуков из `useFinance.ts` — мутация `useDeleteTransactionMutation`: кэш обновляется до ответа сервера, откатывается при ошибке; `useSummaryQuery` инвалидируется после добавления транзакции

---

### Фаза 3 — Tasks Core

**Сервер:**

- [ ] **3.1** `GET/POST /api/tags` + `PATCH/DELETE /api/tags/[id]`
- [ ] **3.2** `GET/POST /api/tasks` + `PATCH/DELETE /api/tasks/[id]` (с поиском и фильтром)
- [ ] **3.3** `GET/POST /api/templates` + `PATCH/DELETE /api/templates/[id]`

**Клиент:**

- [ ] **3.4** `stores/tasks.ts` — `useTasksStore` (Pinia, **только client state**: `searchQuery`, `activeFilter`). Серверные данные — в `useTasks.ts`.
- [ ] **3.4.5** `composables/useTasks.ts` — TanStack Query хуки: `useTasksQuery`, `useTagsQuery`, `useTemplatesQuery` + мутации `useToggleTaskMutation`, `useDeleteTaskMutation`, `useAddTaskMutation` с оптимистичными апдейтами и `invalidateQueries`
- [ ] **3.5** `components/ui/UiTaskRow`, `UiSwipeRow`, `UiDateStrip`, `UiTaskTemplateRow`, `UiStatsCard`
- [ ] **3.6** `components/features/tasks/FocusCard.vue`
- [ ] **3.7** `pages/today.vue` — greeting + stats cards + focus card + flat task list
- [ ] **3.8** `components/features/tasks/TaskSheet.vue` — создание/редактирование задачи
- [ ] **3.9** `pages/tasks/index.vue` — поиск + фильтр All/Open/Done + SwipeRow список
- [ ] **3.10** `pages/tasks/templates.vue` + `components/features/tasks/TemplateSheet.vue`
- [ ] **3.11** *(Claude пишет)* Unit тесты для mapper-функции нормализации тегов из Prisma
- [ ] **3.12** *(Claude пишет)* Store тесты для `useTasksStore` — `toggleTask` оптимистичный апдейт, `toggleTask` откат при ошибке, `deleteTask` удаляет из локального списка
- [ ] **3.13** *(Claude пишет)* E2E тест: регистрация → создание задачи → отметить выполненной (Playwright)
- [ ] **3.14** *(Claude пишет)* E2E тест: логин → добавление транзакции → проверка что баланс обновился

---

### Фаза 4 — PWA + Polish

- [ ] **4.1** Настроить `@vite-pwa/nuxt`: manifest (name, icons, theme_color, start_url `/today`, display `standalone`)
- [ ] **4.2** Workbox стратегия: `NetworkFirst` для API, `CacheFirst` для статики
- [ ] **4.3** Проверить оптимистичные апдейты во всех TanStack Query мутациях (onMutate → onError rollback → onSettled invalidate)
- [ ] **4.4** CSS-переменные светлой темы в `assets/css/main.css` + `useTheme` composable
- [ ] **4.5** `pages/settings.vue` — профиль + все настройки (тема, акцент, язык, уведомления). **Важно:** добавить `definePageMeta({ hideFab: true })` в `settings.vue` и `settings/categories.vue` — FAB не нужен на страницах настроек (условие в `default.vue` читает `route.meta.hideFab`)
- [ ] **4.6** Переключатель темы (Dark / Light / System) → сохранение в `AppSettings`
- [ ] **4.7** Переключатель акцентного цвета (5 вариантов) → сохранение в `AppSettings`
- [ ] **4.8** Переключатель языка EN / RU → сохранение в `AppSettings`, синхронизация `locale.value` при старте приложения
- [ ] **4.9** Анимации: `UiSwipeRow` жесты, `UiSheet` slide-up/down, `UiTabBar` active indicator
- [ ] **4.10** Миграция Prisma: добавить `pinEnabled`, `pinHash` в `AppSettings`
- [ ] **4.11** `pages/auth/pin.vue` — экран ввода PIN: 4-цифровой pad, индикатор попыток, кнопка "Забыл PIN"
- [ ] **4.12** `composables/useAppLock.ts` — логика блокировки: автоблокировка через 5 минут бездействия (`visibilitychange` + `setTimeout`), состояние `isLocked` в `useUiStore`
- [ ] **4.13** PIN setup в Settings: включить PIN → ввести → подтвердить → `bcrypt.hash` → сохранить в `AppSettings`. Сменить PIN, отключить PIN
- [ ] **4.14** Сброс PIN: определить провайдера регистрации (`OAuthAccount` есть → Google re-auth, нет → ввод пароля аккаунта) → при успехе очистить `pinHash`, отключить PIN
- [ ] **4.15** *(Claude пишет)* E2E тест: включить PIN → закрыть приложение → открыть → проверить что показывается PIN-экран

---

### Фаза 5 — CI/CD

- [ ] **5.1** `.github/workflows/ci.yml` — pipeline: `typecheck → lint → build`
- [ ] **5.2** Настроить GitHub Secrets для переменных окружения
- [ ] **5.3** Branch protection rule на `main` (требовать прохождения CI)

---

### Фаза 6 — Docker + Деплой

- [ ] **6.1** `Dockerfile` — multi-stage build (deps → build → production)
- [ ] **6.2** `docker-compose.yml` — app + postgres сервисы
- [ ] **6.3** Настроить деплой на сервер (docker compose pull + up)
