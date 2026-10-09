# ROADMAP.md — MyDay

Чеклист фаз реализации: **один пункт — одна строка**. Как пункт сделан на самом деле, чем отличается от плана и что починено попутно, — в `ARCHITECTURE.md` → «Журнал реализации». Правила работы и конвенции — в `CLAUDE.md`.

Чтобы начать сессию — скажи "приступаем к шагу N". Чтобы завершить шаг — напиши "Идем дальше": Claude отмечает текущий шаг `[x]` и предлагает следующий.

**Читай выборочно:** при работе над конкретным шагом достаточно открыть его фазу, а не весь файл — секции ниже не зависят друг от друга за исключением явных пометок "Требует N.NN".

---

## Фаза 0 — Фундамент

- [x] **0.1** Nuxt 4 проект (`ui` template)
- [x] **0.2** `nuxt.config.ts`: `compatibilityVersion: 4`, `ssr: false` (SPA), модули, `runtimeConfig` с секретами
- [x] **0.3** Tailwind v4: токены через `@theme` и CSS-переменные тем в `assets/css/main.css`
- [x] **0.4** Pinia: auto-import, структура `stores/`
- [x] **0.5** Prisma: `init` + первая миграция
- [x] **0.6** `server/utils/prisma.ts` (singleton)
- [x] **0.7** `.env.example`, подключение к удалённой БД
- [x] **0.8** `shared/types/` и `shared/schemas/` с базовыми Zod-схемами
- [x] **0.9** *(Claude пишет)* Тестовое окружение: vitest, `@nuxt/test-utils`, `@vue/test-utils`, Playwright

---

## Фаза 1 — Auth & Shell

**Сервер:**

- [x] **1.1** `server/utils/jwt.ts` — `signAccessToken`, `signRefreshToken`, `verifyToken`
- [x] **1.2** `server/utils/password.ts` — `hashPassword`, `comparePassword` (bcrypt, cost 12)
- [x] **1.3** `server/middleware/01.auth.ts` — Bearer → `event.context.userId`
- [x] **1.4** `POST /api/auth/register` — User + AppSettings + seed Categories в одной `$transaction`
- [x] **1.5** `POST /api/auth/login`
- [x] **1.6** `POST /api/auth/logout` — удаление RefreshToken, очистка cookie
- [x] **1.7** `POST /api/auth/refresh` — ротация refresh-токена
- [ ] **1.8** `GET /api/auth/oauth/google` + callback — Google OAuth flow (объём v2, см. Фазу 7)
- [x] **1.9** `GET /api/users/me`

**Клиент:**

- [x] **1.10** `stores/auth.ts` — `useAuthStore`: `accessToken`, `user`, `init()`, `refresh()`, `logout()`
- [x] **1.11** Защита маршрутов — глобальный `app/middleware/auth.global.ts` (вместо поштучных `auth.ts`/`guest.ts`)
- [x] **1.12** `layouts/auth.vue`
- [x] **1.13** `pages/auth/welcome.vue`
- [x] **1.14** Базовые `components/ui/`: `UiButton`, `UiInput`, `UiCard`, `UiBadge`, `UiPillSelect`, `UiSwitch`, `UiCheckCircle`, `UiLogoMark`
- [x] **1.15** Лэйаутные `components/ui/`: `UiTabBar`, `UiFab`, `UiEmptyState`, `UiSectionHeader`, `UiSheet`
- [x] **1.16** `pages/auth/login.vue`
- [x] **1.17** `pages/auth/register.vue`
- [x] **1.18** `layouts/default.vue` — TabBar + FAB (`composables/useFabAction.ts`)
- [x] **1.19** *(Claude пишет)* Unit-тесты `jwt.ts`
- [x] **1.20** *(Claude пишет)* Unit-тесты `password.ts`
- [x] **1.21** *(Claude пишет)* Unit-тесты Zod-схем auth
- [x] **1.22** *(Claude пишет)* Store-тесты `useAuthStore`
- [x] **1.23** `server/middleware/02.rateLimit.ts` — 10 попыток за 15 минут с IP на login/register, `429`
- [x] **1.24** `useAppToast` + глобальный обработчик ошибок + `UiToast`

---

## Фаза 2 — Finance Core

**Сервер:**

- [x] **2.1** `prisma/seeds/categories.ts` — стандартные категории
- [x] **2.2** CRUD `/api/categories`
- [x] **2.3** CRUD `/api/finance/transactions` с пагинацией
- [x] **2.4** `GET /api/finance/summary` — income, expense, net, breakdown
- [x] **2.5** `GET/POST/DELETE /api/finance/savings` (PATCH добавлен в v1.1.1)
- [x] **2.6** `GET/POST/PATCH /api/finance/budgets`

**Клиент:**

- [x] **2.7** `composables/useApi.ts` — `$fetch` с `Authorization: Bearer`
- [x] **2.7.5** TanStack Query: `plugins/vue-query.ts` + `composables/queryKeys.ts`
- [x] **2.8** `stores/finance.ts` — только client state
- [x] **2.8.5** `composables/useFinance.ts` — query-хуки и мутации финансов
- [x] **2.8.6** `composables/useCategories.ts`
- [x] **2.9** `UiTxRow`, `UiCategoryTile`, `UiCategoryBar`
- [x] **2.10** `pages/finance/index.vue` — pill-табы + `FinanceTransactionsTab`
- [x] **2.11** `AddTransactionSheet.vue` (заменён на `TransactionEditSheet` в 2.22)
- [x] **2.12** `FinanceSavingsTab.vue`
- [~] **2.13** Budgets UI — отложено в Фазу 7 (дата-слой не удалять)
- [~] **2.14** Категории в Settings — перенесено в **4.5.1**
- [x] **2.15** *(Claude пишет)* Unit-тесты Zod-схем finance
- [x] **2.15.5** *(Claude пишет)* Интеграционные тесты API Фазы 2 — `tests/integration/phase2.test.ts`
- [x] **2.16** *(Claude пишет)* Тесты хуков `useFinance.ts`
- [x] **2.17** Фильтрация транзакций: `from`/`to`, `type`, `categoryIds`, `search`
- [x] **2.18** Проверка принадлежности `categoryId` в транзакциях и бюджетах
- [x] **2.19** Период (дизайн v3): `period` в `financeStore`, `PeriodBar` + `PeriodSheet`, `UiChip`, `UiRoundBtn`, net-hero
- [x] **2.20** Фильтры (дизайн v3): `FilterBar` + `CategoryFilterSheet`
- [x] **2.21** `pages/finance/transactions.vue` — All Transactions с группировкой по дням
- [x] **2.22** `TransactionEditSheet.vue` — create/edit, дата, удаление
- [x] **2.23** Savings v3: история за период, delta badge, `SavingsOpSheet.vue`

---

## Фаза 3 — Tasks Core

**Сервер:**

- [x] **3.1** CRUD `/api/tags`
- [x] **3.2** CRUD `/api/tasks` с поиском и фильтром (проверка принадлежности `tagIds`)
- [x] **3.3** CRUD `/api/templates`

**Клиент:**

- [x] **3.4** `stores/tasks.ts` — только client state (`searchQuery`, `activeFilter`)
- [x] **3.4.5** `composables/useTasks.ts` — хуки и мутации задач, тегов, шаблонов с оптимистикой
- [x] **3.5** `UiTaskRow`, `UiDateStrip`, `UiTaskTemplateRow`, `UiStatsCard`
- [x] **3.6** `FocusCard.vue`
- [x] **3.7** `pages/today.vue` — greeting, stats, focus, список
- [x] **3.8** `TaskSheet.vue` — create/edit задачи
- [x] **3.9** `pages/tasks/index.vue` — поиск, фильтр, свайп-список
- [x] **3.10** `pages/tasks/templates.vue` + `TemplateSheet.vue`
- [x] **3.11** *(Claude пишет)* Unit-тесты маппера тегов
- [x] **3.12** *(Claude пишет)* Store-тесты `useTasksStore`
- [x] **3.13** *(Claude пишет)* E2E: регистрация → задача → выполнена
- [x] **3.14** *(Claude пишет)* E2E: логин → транзакция → баланс обновился

---

## Фаза 4 — PWA + Polish

- [x] **4.1** PWA-манифест и иконки
- [x] **4.2** Workbox: `NetworkFirst` для `/api/*`, `CacheFirst` для статики, прекэш шелла
- [x] **4.3** Аудит оптимистичных апдейтов в мутациях
- [x] **4.4** Светлая тема + 5 палитр акцентов (`useTheme`)
- [x] **4.5** `pages/settings/index.vue` — профиль, Appearance, Preferences, выход
- [x] **4.5.0** Категории: `isSystem` + `key`, системные «Другое», удаление с переносом транзакций
- [x] **4.5.1** `pages/settings/categories.vue` + `CategoryEditSheet`
- [x] **4.6** Тема сохраняется в `AppSettings`
- [x] **4.7** Акцент сохраняется в `AppSettings`
- [x] **4.8** Язык сохраняется в `AppSettings`
- [x] **4.9** Анимации: `UiSwipeRow`, `UiSheet`, `UiTabBar`
- [x] **4.10** ~~Миграция под PIN~~ — поля были в схеме с init-миграции
- [x] **4.11** `pages/auth/pin.vue` — экран блокировки (`UiPinScreen`, `UiPinPad`)
- [x] **4.12** Автоблокировка: `useAppLock` + `lock.global.ts` + `appLock.client.ts`
- [x] **4.13** PIN setup в Settings + `PUT/DELETE /api/settings/pin`, `POST /api/settings/pin/verify`
- [x] **4.14** Сброс PIN по паролю — `POST /api/settings/pin/reset`, `PinResetSheet`
- [x] **4.15** *(Claude пишет)* E2E `tests/e2e/pin.spec.ts`

---

## Фаза 5 — CI/CD

- [x] **5.1** `.github/workflows/ci.yml`
- [x] **5.1.1** Тесты в CI: `quality`, `integration`, `e2e`
- [x] **5.1.2** Починен зависающий `nuxt build`
- [x] **5.1.3** Починены первые падения CI
- [~] **5.2** ~~GitHub Secrets~~ — CI секреты не нужны
- [x] **5.3** Branch protection на `main`

---

## Фаза 6 — Docker + Деплой

- [x] **6.1** `Dockerfile` — multi-stage `deps → migrate / build → runtime`
- [x] **6.2** `docker-compose.yml` — `db` + `migrate` + `app`
- [x] **6.3** Деплой на сервер (`docker compose up -d --build`)

---

## Фаза 7 — После MVP: бюджеты, планировщик, повторы

Budgets и Notifications вынесены за MVP (решение 28.07.2026). Не ломать: модель `Budget`, `GET/POST /api/finance/budgets`, `useBudgetQuery`/`useUpsertBudgetMutation`, утилиты периода, `PeriodBar`, спеки Finance v3 в `DESIGN.md`.

**Порядок: 7.5 → 7.6 → 7.1–7.3**, дальше остальное. Бюджеты поверх реестра без аренды и подписок показывают прогресс не про то, а планировщик из 7.5 нужен сразу трём пунктам. **1.8** (Google OAuth) — тоже объём v2.

- [ ] **7.1** Budgets — модель: помесячная (`Budget.month`) vs повторяющийся лимит на категорию; делать после 7.6
- [ ] **7.2** Budgets UI: `FinanceBudgetsTab` + `BudgetEditSheet`, вернуть таб `budgets`
- [ ] **7.3** *(Claude пишет)* Интеграционные тесты budgets: spent по периоду, перерасход, upsert
- [ ] **7.4** Notifications — Web Push (`PushSubscription`, VAPID, тумблер в Settings); iOS только для установленной PWA ≥ 16.4
- [ ] **7.5** Планировщик Nitro (`scheduledTasks`) — идемпотентный и догоняющий, одна реплика
- [ ] **7.6** Повторяющиеся операции: `RecurringTransaction` → материализация в `Transaction` планировщиком; до 7.1
- [ ] **7.7** Повторяющиеся задачи: правило повтора на `TaskTemplate`
- [ ] **7.8** Связь задач и финансов: сумма на задаче → транзакция при выполнении; траты дня на Today
- [ ] **7.9** Тренды: месяц к месяцу, динамика по категориям, первый график
- [ ] **7.10** Экспорт CSV/JSON + `DELETE /api/users/me`

**Не берём в v2:** мультивалютность (это отдельная фаза — переписывается каждая агрегация) и фото чеков (нет слоя хранения файлов).

---

## Фаза 8 — Релиз v2.0 «День с семьёй»

Главное в релизе — общие финансы семьи; рядом теги на транзакциях, цели накоплений, privacy mode и офлайн-запись. **Порядок: 8.0 → 8.1–8.5 → 8.6–8.7 → 8.8–8.9 → 8.11**, 8.10 — в любой момент. Теги и цели — после перевода scope на семью, сразу с `householdId`, иначе их придётся мигрировать второй раз.

- [ ] **8.0** Решения по семье в `ARCHITECTURE.md`: задачи личные, вступление объединяет данные, уходящий забирает копию, копилка — флаг семьи, теги семейные
- [ ] **8.1** `Household` + `HouseholdMember` + `HouseholdInvite`, миграция: каждому семья из одного, `householdId` на финансах и тегах
- [ ] **8.2** Scope финансов `userId` → `householdId`: `getHousehold(event)`, finance-эндпоинты, категории, теги, корзина, проверка relation-id
- [ ] **8.3** *(Claude пишет)* Интеграционные тесты семьи: изоляция, приглашения, слияние, выход, копилка
- [ ] **8.4** API приглашений: ссылка-токен на 7 дней, превью, вступить / выйти / исключить, роль owner
- [ ] **8.5** Слияние данных при вступлении и копия записей при выходе
- [ ] **8.6** Дизайн «Семьи» в Claude Design по брифу → спека в `DESIGN.md`
- [ ] **8.7** UI семьи: экран «Семья», приглашение и вступление по ссылке, автор в строке транзакции, фильтр «мои / все»
- [ ] **8.8** Теги на транзакциях (B.15): `TransactionTag`, фильтр по тегу в `transactionWhere`
- [ ] **8.9** Цели накоплений (B.13): `SavingsGoal` (название, сумма, дедлайн), прогресс и «откладывать X ₽ в месяц»
- [ ] **8.10** Privacy mode (B.20): тап по балансу прячет суммы (`•••`), состояние на клиенте
- [ ] **8.11** Офлайн-запись (B.14): outbox в IndexedDB с `Idempotency-Key`; Background Sync где есть, на iOS — досылка при `online` и открытии
- [ ] **8.12** *(Claude пишет)* E2E: приглашение в семью, офлайн-запись траты
- [ ] **8.13** Релиз v2.0.0 через `/release`

---

## Бэклог (вне фаз)

**Баги:**

- [x] **B.3** Карточка накоплений: бейдж отжимал сумму, `₽` переносился

**Задачи:**

- [x] **B.4** Гайд по установке PWA на домашний экран
- [x] **B.9** Удаление тегов — экран «Настройки → Теги»
- [x] **B.10** Soft delete задач, транзакций и записей копилки (`deletedAt`, хранение 30 дней)
- [x] **B.11** «Отменить» в тосте после удаления
- [x] **B.12** Корзина «Недавно удалённые» в настройках

**Идеи (решить, что брать в фазу 7):**

- [ ] **B.5** Экспорт CSV → сводка месяца в Obsidian через Claude Code (после 7.10); делать первой
- [x] **B.6** Patch notes в настройках — сделано в v1.1.0 через скилл `/release`, а не генератором из коммитов
- [ ] **B.7** «Сообщить о баге»: GitHub Issue через fine-grained токен или таблица `Feedback`; в самый конец
- [ ] **B.8** LLM в приложении — только быстрый ввод текстом («кофе 350» → транзакция); сначала ответить «зачем»
- [ ] **B.16** Чеклист в задаче: модель `Subtask` (title, done, order), прогресс `2/5` в строке задачи
- [ ] **B.17** Режим фокуса: таймер на `FocusCard`, сначала только на клиенте; лог `FocusSession` — если понадобится B.19
- [ ] **B.18** Привычки: `Habit` + отметки по дням, ежедневно без дедлайна, серия; отдельно от повторяющихся задач 7.7
- [ ] **B.19** Недельный обзор: сделано / перенесено / траты по категориям; напоминание в воскресенье — после 7.4 и 7.5
- [ ] **B.21** Глобальный поиск по задачам и транзакциям + командная палитра
- [ ] **B.22** MyDay как MCP-сервер для Claude/Obsidian: чтение задач, транзакций, сводки и быстрый ввод по персональному токену; может заменить B.5
- [ ] **B.23** Daily allowance на Today: «можно потратить сегодня N ₽» = остаток бюджета / дней до конца периода; после 7.1
