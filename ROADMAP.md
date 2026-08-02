# ROADMAP.md — MyDay

Чеклист фаз реализации. Правила работы, конвенции и текущая архитектура — в `CLAUDE.md` и `ARCHITECTURE.md`.

Чтобы начать сессию — скажи "приступаем к шагу N". Чтобы завершить шаг — напиши "Идем дальше": Claude отмечает текущий шаг `[x]` и предлагает следующий.

**Читай выборочно:** при работе над конкретным шагом достаточно открыть его фазу, а не весь файл — секции ниже не зависят друг от друга за исключением явных пометок "Требует N.NN".

---

### Фаза 0 — Фундамент

- [x] **0.1** Создать Nuxt 4 проект: `pnpm dlx nuxi@latest init myday`, выбрать `ui` template
- [x] **0.2** Настроить `nuxt.config.ts`: `compatibilityVersion: 4`, `ssr: false` (SPA режим — все страницы за авторизацией, SSR не нужен), модули (`@pinia/nuxt`, `@vite-pwa/nuxt`), `runtimeConfig` с секретами
- [x] **0.3** Установить и настроить Tailwind v4: токены через `@theme` и CSS-переменные тем в `assets/css/main.css` (конфиг-файла нет — CSS-first подход v4)
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
- [x] **1.24** `composables/useAppToast.ts` + глобальный обработчик ошибок — toast-очередь в `useUiStore`, Nuxt `app:error` hook для непойманных ошибок, компонент `UiToast`

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
- [~] **2.13** ~~Раздел Budgets~~ → отложено до v2 (**Фаза 7**, решение 28.07.2026). Сейчас: скрыть option `budgets` из `tabOptions` в `pages/finance/index.vue` (одна строка). Дата-слой (модель `Budget`, `GET/POST /api/finance/budgets`, `useBudgetQuery`/`useUpsertBudgetMutation`, queryKey `budgets`) не удалять
- [~] **2.14** ~~Управление категориями в Settings~~ → перенесено в Фазу 4 (**4.5.1**). Settings делаем целиком одним блоком, чтобы не строить каркас настроек в два захода. Дата-слой (`useCategories.ts`) уже готов.
- [x] **2.15** *(Claude пишет)* Unit тесты для Zod-схем finance — невалидная сумма (отрицательная, строка), неизвестная категория
- [x] **2.15.5** *(Claude пишет)* Интеграционные тесты для API эндпоинтов Фазы 2 — `tests/integration/phase2.test.ts` (13 passed, 1 skip). Инфра: `docker-compose.test.yml` (Postgres :5434), `vitest.integration.config.ts`, env из `.env.test`. Запуск: `pnpm test:db:up && pnpm test:integration`. **Нашли баг:** `POST /api/categories` всегда 500 — `createCategorySchema` без `color` и с опциональным `icon`, а в БД оба required (тест заскипан, разблокировать в 4.5.1). (через `@nuxt/test-utils`, тестовая БД): `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`, `GET/POST /api/finance/transactions`, `PATCH/DELETE /api/finance/transactions/[id]`, `GET /api/finance/summary`, `GET/POST/DELETE /api/finance/savings`, `GET/POST/PATCH /api/finance/budgets` — проверить: `userId` изоляция (нельзя получить чужие данные), валидация входных данных, корректность агрегации в summary
- [x] **2.16** *(Claude пишет)* Тесты для TanStack Query хуков из `useFinance.ts` — `tests/unit/composables/useFinance.test.ts`: инвалидация `transactions`+`summary` в `onSuccess`, тост-ошибка в `onError`, реальный рефетч активного `useSummaryQuery` после добавления транзакции. **Тест на оптимистичный откат → перенесён в 4.3** (в текущем коде мутаций нет `onMutate`/rollback — оптимистика появится в Фазе 4)
- [ ] **2.17** Унифицировать фильтрацию транзакций: `GET /api/finance/transactions` принимает `from`/`to` (сейчас игнорирует даты полностью — переключение месяца не фильтрует список). Режимы UI: конкретный месяц (по умолчанию текущий — главная Finance), произвольный диапазон, все подряд (без `from`/`to`). Границы вычисляет клиент (см. «Таймзоны» в `ARCHITECTURE.md`). Совпадает с моделью периода из дизайна v3 (`{ mode: 'month' | 'range' | 'all' }`, DESIGN.md → Finance v3). Заодно серверные параметры фильтров v3: `type`, `categoryIds`, `search` (по notes). **Сделать до вёрстки периодов и фильтров (2.19–2.21)**
- [ ] **2.18** Проверка принадлежности `categoryId` в `POST/PATCH /api/finance/transactions` и `POST /api/finance/budgets` (см. `.claude/skills/auth-security-patterns/`); заодно 400 вместо 500 при несуществующей категории
- [ ] **2.19** Период (дизайн v3): `financeStore` — заменить `currentMonth: Date` на объект `period` (модель в DESIGN.md → Finance v3); `PeriodBar.vue` + `PeriodSheet.vue` (features/finance, контент внутри `UiSheet`) + базовые `UiChip.vue`, `UiRoundBtn.vue`; PeriodBar на табах Transactions и Savings (Budgets — v2); hero → net за период (danger при минусе, stacked bar income/expense). Утилиты периода (`periodRange` и т.п.) — отдельным файлом, в v2 их переиспользуют бюджеты. Требует 2.17
- [ ] **2.20** Фильтры (дизайн v3): `FilterBar.vue` (тип + чип категорий + поиск, Reset) + `CategoryFilterSheet.vue` (multi-select с Clear / Show · N); состояние фильтров — client state
- [ ] **2.21** `pages/finance/transactions.vue` — All Transactions (дизайн v3): группировка по дням со sticky-заголовками и дневным net, ResultSummary, `UiSwipeRow` с `rightAction` accent «Edit», empty state с «Clear filters». Точка входа «See all →» из секции Recent
- [ ] **2.22** `AddTransactionSheet` → `TransactionEditSheet.vue` (дизайн v3): dual-mode create/edit, новое поле даты (бэкдейт), кнопка «Delete transaction» в режиме edit
- [ ] **2.23** Savings v3: история операций за период (PeriodBar + список deposit/withdrawal), delta badge за период; `AddSavingsSheet` → `SavingsOpSheet.vue` (deposit | withdraw, quick amounts, «Available · $X»). Баланс — всегда total (решение не меняется)

---

### Фаза 3 — Tasks Core

**Сервер:**

- [x] **3.1** `GET/POST /api/tags` + `PATCH/DELETE /api/tags/[id]`
- [x] **3.2** `GET/POST /api/tasks` + `PATCH/DELETE /api/tasks/[id]` (с поиском и фильтром). **Не забыть:** проверка принадлежности `tagIds` (см. `.claude/skills/auth-security-patterns/`)
- [ ] **3.3** `GET/POST /api/templates` + `PATCH/DELETE /api/templates/[id]`

**Клиент:**

- [ ] **3.4** `stores/tasks.ts` — `useTasksStore` (Pinia, **только client state**: `searchQuery`, `activeFilter`). Серверные данные — в `useTasks.ts`.
- [ ] **3.4.5** `composables/useTasks.ts` — TanStack Query хуки: `useTasksQuery`, `useTagsQuery`, `useTemplatesQuery` + мутации `useToggleTaskMutation`, `useDeleteTaskMutation`, `useAddTaskMutation` с оптимистичными апдейтами и `invalidateQueries`
- [ ] **3.5** `components/ui/UiTaskRow`, `UiSwipeRow`, `UiDateStrip`, `UiTaskTemplateRow`, `UiStatsCard`. `UiSwipeRow` — сразу с поддержкой `rightAction` (см. DESIGN.md → UiSwipeRow): компонент переиспользуется в All Transactions (2.21)
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
- [ ] **4.3** Проверить оптимистичные апдейты во всех TanStack Query мутациях (onMutate → onError rollback → onSettled invalidate). **Сюда же — тест из 2.16**: `useDeleteTransactionMutation` обновляет кэш до ответа сервера и откатывается при ошибке (пишется вместе с реализацией `onMutate`/rollback)
- [ ] **4.4** CSS-переменные светлой темы в `assets/css/main.css` + `useTheme` composable
- [ ] **4.5** `pages/settings.vue` — профиль + все настройки (тема, акцент, язык; уведомления — v2, тумблер не делаем). **Важно:** добавить `definePageMeta({ hideFab: true })` в `settings.vue` и `settings/categories.vue` — FAB не нужен на страницах настроек (условие в `default.vue` читает `route.meta.hideFab`)
- [ ] **4.5.0** Категории — системная «Другое» (решение 28.07.2026): миграция `Category.isSystem Boolean @default(false)`; сид двух «Другое» (EXPENSE + INCOME, `isSystem: true`) в `seedCategories` + бэкфилл существующим пользователям в миграции; `DELETE /api/categories/[id]` — запрет удаления `isSystem` (400), переназначение транзакций на «Другое» того же типа + удаление бюджетов категории в одной `$transaction`; `PATCH` — запрет смены типа/удаления у `isSystem`
- [ ] **4.5.1** `pages/settings/categories.vue` — управление категориями (список + создать/редактировать/удалить). Перенесено из 2.14. Дата-слой `useCategories.ts` готов; нужен только UI + точка входа из хаба настроек. Требует **4.5.0**. **Сначала починить `POST /api/categories`** (баг из 2.15.5): добавить `color` в `createCategorySchema` и решить судьбу `icon` (required или дефолт в БД), затем разблокировать skip-тест в `tests/integration/phase2.test.ts`. В UI «Другое» показывать без кнопки удаления
- [ ] **4.6** Переключатель темы (Dark / Light / System) → сохранение в `AppSettings`
- [ ] **4.7** Переключатель акцентного цвета (5 вариантов) → сохранение в `AppSettings`
- [ ] **4.8** Переключатель языка EN / RU → сохранение в `AppSettings`, синхронизация `locale.value` при старте приложения
- [ ] **4.9** Анимации: `UiSwipeRow` жесты, `UiSheet` slide-up/down, `UiTabBar` active indicator
- [x] **4.10** ~~Миграция Prisma: добавить `pinEnabled`, `pinHash` в `AppSettings`~~ — поля уже в схеме с init-миграции, отдельная миграция не нужна
- [ ] **4.11** `pages/auth/pin.vue` — экран ввода PIN: 4-цифровой pad, индикатор попыток, кнопка "Забыл PIN"
- [ ] **4.12** `composables/useAppLock.ts` — логика блокировки: автоблокировка через 5 минут бездействия (`visibilitychange` + `setTimeout`), состояние `isLocked` в `useUiStore`
- [ ] **4.13** PIN setup в Settings: включить PIN → ввести → подтвердить → `bcrypt.hash` → сохранить в `AppSettings`. Сменить PIN, отключить PIN
- [ ] **4.14** Сброс PIN: определить провайдера регистрации (`OAuthAccount` есть → Google re-auth, нет → ввод пароля аккаунта) → при успехе очистить `pinHash`, отключить PIN
- [ ] **4.15** *(Claude пишет)* E2E тест: включить PIN → закрыть приложение → открыть → проверить что показывается PIN-экран

---

### Фаза 5 — CI/CD

- [x] **5.1** `.github/workflows/ci.yml` — pipeline: `lint → typecheck → build`
- [ ] **5.1.1** Добавить прогон тестов в CI: шаг `pnpm test` (unit) перед build
- [ ] **5.2** Настроить GitHub Secrets для переменных окружения
- [ ] **5.3** Branch protection rule на `main` (требовать прохождения CI)

---

### Фаза 6 — Docker + Деплой

- [ ] **6.1** `Dockerfile` — multi-stage build (deps → build → production)
- [ ] **6.2** `docker-compose.yml` — app + postgres сервисы
- [ ] **6.3** Настроить деплой на сервер (docker compose pull + up)

---

### Фаза 7 — v2 (после MVP)

Budgets и Notifications осознанно вынесены за MVP (решение 28.07.2026). Что уже проложено и что нельзя ломать: модель `Budget` + `GET/POST /api/finance/budgets` + `useBudgetQuery`/`useUpsertBudgetMutation` + queryKey `budgets`; утилиты периода из 2.19 (переиспользуются бюджетами); `UiChip`/`UiRoundBtn`/`PeriodBar`; спеки UI в DESIGN.md → Finance v3 (BudgetsTab, BudgetEditSheet).

- [ ] **7.1** Budgets — решить модель: помесячная (`Budget.month`, как в БД сейчас) vs повторяющийся лимит на категорию (как в дизайне v3 — тогда миграция: убрать `month`, unique `[userId, categoryId]`, upsert упрощается; теряем историю лимитов по месяцам)
- [ ] **7.2** Budgets UI по DESIGN.md → Finance v3: `FinanceBudgetsTab.vue` (Total card + карточки с прогрессом + empty state) + `BudgetEditSheet.vue`; вернуть option `budgets` в `tabOptions` на `pages/finance/index.vue`
- [ ] **7.3** *(Claude пишет)* Интеграционные тесты budgets: агрегация spent по периоду, перерасход, upsert
- [ ] **7.4** Notifications — Web Push: модель `PushSubscription`, VAPID-ключи, отправка из Nitro, cron-планировщик проверки дедлайнов; поле `notifications` в `AppSettings` + тумблер в Settings. Кандидаты: напоминания по dueDate, утренний дайджест Today, превышение бюджета. Ограничение iOS: push только для PWA, установленной на домашний экран (iOS ≥ 16.4)
