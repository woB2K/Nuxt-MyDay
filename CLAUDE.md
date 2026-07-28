# CLAUDE.md — MyDay Project Guide

## Описание проекта

**MyDay** — комбинированное приложение: управление задачами + личные финансы.

**Стек:** Nuxt 4 + Vue 3, PostgreSQL + Prisma 7 (driver adapter, клиент генерится в `prisma/.generated/`), Tailwind CSS v4 (CSS-first конфиг, без `tailwind.config.js`) + Nuxt UI, Pinia + TanStack Query, Zod, OAuth 2 (Google) + JWT (access/refresh), PWA, GitHub Actions.

**Дизайн:** мобильный (390×844), iOS-inspired, dark-first с поддержкой светлой темы. Дизайн-токены и компоненты — в `DESIGN.md`.

### Карта документации

| Файл | Что внутри | Когда открывать |
|---|---|---|
| `CLAUDE.md` (этот файл) | Правила работы, конвенции, состояние проекта | Загружается всегда — держим лин |
| `ARCHITECTURE.md` | Решения по БД, ER-диаграмма, auth-flow, зоны риска, известные баги | Работа с БД/архитектурой, риск-рефакторинг |
| `ROADMAP.md` | Чеклист фаз реализации | Перед стартом/завершением конкретного шага |
| `DESIGN.md` | Дизайн-токены, спеки экранов и компонентов | Вёрстка UI |
| `.claude/skills/*` | Готовые кодовые паттерны проекта (auth, Prisma, TanStack Query, UI feedback) | Подгружаются автоматически, когда релевантны задаче |

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

## Как работать по шагам (ROADMAP.md)

- **Начало сессии:** говорю "приступаем к шагу N" → открой `ROADMAP.md`, найди пункт N и прочитай контекст его фазы (не весь файл целиком — он большой и почти всегда нерелевантен вне текущей фазы).
- **Пункт касается решения по БД/security/рисков** → сверься с `ARCHITECTURE.md`, прежде чем предлагать реализацию.
- **Есть готовый паттерн под задачу** (auth, Prisma, TanStack Query, UI feedback) → используй skill из `.claude/skills/`, не изобретай заново — Claude Code подгружает их сам по релевантности.
- **Завершение шага:** говорю "Идём дальше" → отметь пункт `[x]` в `ROADMAP.md`, предложи следующий.

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

## Файловая структура (верхнеуровневая карта)

```
myday/
├── app/                               # весь клиентский код (Nuxt 4)
│   ├── app.vue
│   ├── assets/css/main.css            # Tailwind v4 @theme — конфиг-файла нет
│   ├── components/
│   │   ├── ui/                        # UiButton, UiInput, UiCard... — без бизнес-логики
│   │   └── features/{auth,tasks,finance,settings}/
│   ├── composables/                   # queryKeys.ts, useApi.ts, useFinance.ts, useTasks.ts, useCategories.ts, useAppToast.ts
│   ├── plugins/                       # errorHandler.ts, vue-query.ts
│   ├── layouts/                       # default.vue (TabBar+FAB), auth.vue
│   ├── middleware/                    # auth.ts, guest.ts
│   ├── pages/
│   ├── stores/                        # ТОЛЬКО client state — см. «Pinia vs TanStack» ниже
│   └── utils/
│
├── server/
│   ├── api/                           # REST-роуты по Nuxt-конвенции (см. «API endpoints»)
│   ├── middleware/                    # 01.auth.ts, 02.rateLimit.ts — нумерация = порядок выполнения
│   └── utils/                         # jwt.ts, password.ts, mapper.ts, rateLimit.ts, prisma.ts
│
├── shared/                            # изоморфный слой (client + server)
│   ├── types/                         # singular: task.ts, tag.ts, finance.ts
│   └── schemas/                       # Zod — одна схема на клиент и сервер
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seeds/                         # categories.ts, users.ts
│
├── i18n/locales/{en,ru}.json
│
├── tests/
│   ├── unit/                          # vitest: schemas, server utils, stores, composables
│   └── integration/                   # API-тесты против тестовой БД (Postgres :5434)
│
├── .env.example, nuxt.config.ts, prisma.config.ts, docker-compose.test.yml
├── vitest.config.ts, vitest.integration.config.ts, playwright.config.ts, tsconfig.json
├── CLAUDE.md, ARCHITECTURE.md, ROADMAP.md, DESIGN.md
└── .claude/skills/
```

Конкретные файлы внутри `server/api/*` следуют CRUD-конвенции 1-в-1 (см. таблицу «API endpoints» ниже) — не дублируем их здесь построчно, дерево смотри через `ls`/`glob` при необходимости.

**Важно:** `tailwind.config.js` нет — Tailwind v4 конфигурируется через CSS (`@theme` в `assets/css/main.css`).

---

## Соглашения

### Именование файлов
| Тип | Соглашение | Пример |
|-----|-----------|--------|
| Vue компоненты | PascalCase | `UiButton.vue`, `TaskRow.vue` |
| Composables | camelCase с `use` | `useFinance.ts` |
| Stores | camelCase | `auth.ts` → экспорт `useAuthStore` |
| Серверные утилиты | camelCase | `jwt.ts`, `password.ts` |
| Типы / схемы | camelCase, singular | `task.ts`, `tag.ts` |
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

```ts
// Всегда composable-стиль, не options-стиль
export const useFinanceStore = defineStore('finance', () => {
  // ТОЛЬКО client state — UI-фильтры, не данные с сервера
  const currentMonth = ref<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')
  return { currentMonth, activeTab }
})
```

Подробные паттерны TanStack Query (query keys, useQuery/useMutation, оптимистичные апдейты) — в `.claude/skills/tanstack-query-patterns/`.

### Prisma модели
- PascalCase singular: `User`, `Task`, `Transaction`
- Поля: camelCase: `createdAt`, `passwordHash`
- Enums: SCREAMING_SNAKE_CASE значения: `INCOME`, `EXPENSE`

### Zod схемы
```ts
// shared/schemas/task.ts — одна схема, два использования
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
// Успех пагинация → return { data, total, page, limit } (см. transactions/index.get.ts)
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

Решения по схеме, зоны риска и известные баги — в `ARCHITECTURE.md`.

---

## Безопасность

### userId всегда из контекста

`userId` всегда берётся из JWT (через `event.context.userId`), никогда из query/body запроса.

```ts
// ❌ Никогда так
const { userId } = await readBody(event)

// ✅ Всегда так
const userId = event.context.userId // проставляет server/middleware/01.auth.ts
```

Иначе любой аутентифицированный пользователь может передать чужой `userId` и получить доступ к чужим данным.

Полный паттерн проверки `categoryId`/`tagIds` и других relation-id из body на принадлежность пользователю — в `.claude/skills/auth-security-patterns/`.
