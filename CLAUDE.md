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
| `.claude/skills/*` | Готовые кодовые паттерны проекта (auth, Prisma, TanStack Query, UI feedback, даты и периоды, инвентарь Ui-компонентов) | Подгружаются автоматически, когда релевантны задаче |

---

## Правила работы (обязательно прочти)

Код пишешь ты (Claude), я ревьюю и принимаю.

1. **Пиши код сразу.** Описал задачу или назвал шаг роадмапа — реализуй. Не объясняй подход и не жди, пока я напишу сам.
2. **Доводи шаг до конца:** код + i18n-ключи (`en` + `ru`) + тесты, где они осмысленны. Не оставляй половину с «дальше по аналогии».
3. **Не спрашивай разрешения на рутину.** Выбор между равнозначными вариантами делай сам и скажи, что выбрал. Спрашивай только когда варианты реально расходятся по продукту (например, поведение UI, которого нет в `DESIGN.md`).
4. **Отчёт после работы — короткий:** что сделано, какие файлы, что я должен знать (неочевидные решения и что осталось). Без пересказа кода построчно.
5. **Плохое решение — скажи прямо** и предложи лучшее, но одним абзацем, без лекции. Если я настаиваю — делаем как я сказал.
6. **Конвенции проекта соблюдаются молча:** pnpm, `userId` из JWT-контекста, Zod-схемы в `shared/`, Pinia только для client state, весь текст через `t()`, скиллы из `.claude/skills/` вместо изобретения паттернов.
7. **Проверяй себя сам** перед отчётом: `pnpm lint`, `pnpm typecheck`, релевантные тесты. Упало — починил и сказал, что падало. Typecheck обязателен: он ловит то, что lint не видит (несовпадение типов в хуках и шаблонах Vue).
8. **Комментарии в коде не пишем.** Код должен читаться сам. Если решение неочевидно — скажи об этом в отчёте или, если это архитектурное решение, зафиксируй в `ARCHITECTURE.md`.

**Тесты** пишешь тоже ты. Длинных объяснений не нужно — достаточно строчки, что покрывает тест-файл.

---

## Как работать по шагам (ROADMAP.md)

- **Начало сессии:** говорю "приступаем к шагу N" → открой `ROADMAP.md`, найди пункт N и прочитай контекст его фазы (не весь файл целиком — он большой и почти всегда нерелевантен вне текущей фазы).
- **Пункт касается решения по БД/security/рисков** → сверься с `ARCHITECTURE.md`, прежде чем реализовывать.
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
│   ├── middleware/                    # auth.global.ts, lock.global.ts — оба глобальные, на страницах не объявляются
│   ├── pages/
│   ├── stores/                        # ТОЛЬКО client state — см. «Pinia vs TanStack» ниже
│   └── utils/                         # чистые функции, автоимпорт: formatDate.ts, formatAmount.ts, period.ts, transactionFilters.ts, transactionGroups.ts, routes.ts
│
├── server/
│   ├── api/                           # REST-роуты по Nuxt-конвенции (см. «API endpoints»)
│   ├── middleware/                    # 01.auth.ts, 02.rateLimit.ts — нумерация = порядок выполнения
│   └── utils/                         # jwt.ts, password.ts, pin.ts, authCookie.ts, mapper.ts, rateLimit.ts, prisma.ts, dbError.ts, transactionWhere.ts, dateRange.ts
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
| **Client state** — данные которыми владеет UI | Pinia | `accessToken`, `isLocked`, `toasts`, `period`, `filters`, `activeTab` |
| **Server state** — данные с API, кэшируемые | TanStack Query | `transactions`, `summary`, `savings`, `tasks`, `categories`, `tags` |

**Правило:** компоненты вызывают TanStack Query хуки напрямую из `composables/useFinance.ts` и `composables/useTasks.ts`. Pinia-сторы НЕ содержат серверные данные и НЕ вызывают TanStack Query.

```ts
// Всегда composable-стиль, не options-стиль
export const useFinanceStore = defineStore('finance', () => {
  // ТОЛЬКО client state — выбор периода и фильтры, не данные с сервера
  const period = ref<Period>(periodPresets.thisMonth())
  const filters = ref<TransactionFilters>(emptyFilters())
  const activeTab = ref<'transactions' | 'savings' | 'budgets'>('transactions')
  return { period, filters, activeTab }
})
```

Сама логика периода и фильтров — чистые функции в `app/utils/` (`period.ts`, `transactionFilters.ts`), стор только хранит выбор. Из них же собираются ключи кэша и query-параметры запроса — см. skill `date-period-patterns`.

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

# Интеграционные тесты API (нужен контейнер тестовой БД)
pnpm test:db:up && pnpm test:integration

# E2E тесты (Playwright) — тоже против тестовой БД, свой дев-сервер на :3100
pnpm test:db:up && pnpm test:e2e

# E2E с UI (удобно при разработке)
pnpm test:e2e --ui
```

**Проверять фичи руками нужно по `http://<LAN-IP>:3000`, а не по `localhost`.** Браузер считает localhost secure context, а LAN-адрес — нет, и на этой разнице уже трижды прятались настоящие баги (см. `ARCHITECTURE.md` → «Проверять по LAN-адресу»).

E2E поднимает собственный `nuxt dev --dotenv .env.test --port 3100`, поэтому не конфликтует с твоим `pnpm dev` на :3000 и никогда не пишет в dev-базу. Браузер ставится один раз: `pnpm exec playwright install chromium`.

Интеграционным и E2E-тестам нужен файл `.env.test` — скопируй `.env.test.example` → `.env.test` (в нём только тестовые значения, секретов нет; CI делает то же самое).

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
