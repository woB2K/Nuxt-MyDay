---
name: date-period-patterns
description: Работа с датами и периодами в MyDay — контракт YYYY-MM-DD между клиентом и сервером, утилиты formatDate/period/transactionFilters, разница @db.Date и timestamp, фильтрация по периоду и сборка ключей кэша. Используй при любой работе с датами: поля дат в формах и API, фильтры и переключатели периода, группировка по дням, дедлайны задач, агрегации за месяц.
---

# Даты и периоды — MyDay

Сервер TZ-agnostic: «сегодня» и границы периода считает клиент в своей таймзоне и передаёт готовыми (`ARCHITECTURE.md` → «Таймзоны»). Ниже — как это выглядит в коде и где на этом уже спотыкались.

## Контракт: на проводе только `YYYY-MM-DD`

`Transaction.date` и `Budget.month` — `DateTime @db.Date`, то есть календарный день без времени. Поэтому и в query (`from`/`to`), и в body (`date`) ходит date-only строка. Схемы отвергают полный ISO datetime с 400 (`z.iso.date()`, не `z.iso.datetime()`).

```ts
// ❌ Так был баг: UTC-мгновение, Postgres обрезал до UTC-дня.
// В UTC−7 вечерняя транзакция уезжала на следующий день, 31-го — в следующий месяц.
date: new Date().toISOString()

// ✅ Календарный день клиента
date: toDateString()                  // app/utils/formatDate.ts
```

Обратная сторона того же правила: **date-only строку нельзя читать локальными геттерами**. `new Date('2026-07-24')` — это UTC-полночь, и `getDate()` в отрицательном офсете вернёт 23-е.

```ts
fromDateString('2026-07-24')          // → локальная календарная дата, для Intl и вёрстки
toDayKey(tx.date)                     // → '2026-07-24' из '2026-07-24T00:00:00.000Z', для группировки
formatDate(tx.date) / formatDay(...)  // → уже разбирают date-only правильно
formatDateTime(entry.createdAt)       // → только для настоящих timestamp'ов
```

## Три вида дат в проекте — не путать

| Что | Тип в БД | Как фильтровать |
|---|---|---|
| `Transaction.date`, `Budget.month` | `DateTime @db.Date` | `gte: new Date(from)`, `lte: new Date(to)` — границы совпадают с днями |
| `SavingsEntry.createdAt` (у копилки своей даты нет) | `DateTime` (timestamp) | `timestampRange(from, to)` из `server/utils/dateRange.ts`: `>= from 00:00Z`, `< to + 1 день`. Иначе записи, сделанные днём `to`, выпадут из выборки |
| `Task.dueDate` и прочее из Фазы 3 | смотреть `schema.prisma` перед фильтрацией | по типу колонки, см. две строки выше |

## Период — объект, а не месяц

`app/utils/period.ts`, размеченное объединение по `mode`; `month`/`from`/`to` — date-only строки, никаких `Date` в сторе.

```ts
type Period =
  | { mode: 'month', month: string, preset: PeriodPreset }
  | { mode: 'range', from: string, to: string, preset: PeriodPreset }
  | { mode: 'all', preset: PeriodPreset }

periodRange(period)   // → { from, to } | null — null означает «без параметров», всё время
periodKey(period)     // → 'from_to' | 'all' — стабильная строка для ключа кэша
monthPeriod(month)    // → период месяца, сам проставит preset thisMonth/lastMonth/custom
shiftMonth(month, ±1) // → шаг стрелками PeriodBar
periodPresets.thisMonth() / lastMonth() / last3() / thisYear() / all()
```

Живёт в `financeStore.period` (client state). Бюджеты в v2 переиспользуют те же утилиты — не дублировать.

## Период + фильтры → запрос и ключ кэша

Клиентские фильтры — `app/utils/transactionFilters.ts` (`type` / `categoryIds` / `search`). Оттуда же берутся и query-параметры, и часть ключа:

```ts
queryKey: computed(() => queryKeys.transactions(periodKey(period.value), filterKey(filters.value))),
queryFn: () => api(url, { query: { ...periodRange(period.value), ...filterQuery(filters.value) } })
```

`filterKey` сортирует categoryIds — иначе один и тот же набор, выбранный в другом порядке, заводил бы отдельную запись в кэше. `periodRange` даёт `null` для «всего времени», спред `null` — пустой объект, запрос уходит без `from`/`to`.

## Сервер: одна схема и один WHERE

Список транзакций и summary принимают одинаковый набор фильтров: `transactionFilterQuerySchema` (+ `page`/`limit` в списке), WHERE собирает `server/utils/transactionWhere.ts`. Копилка — `savingsQuerySchema`. Валидировать только через `getValidatedQuery(event, schema.parse)`: ручной `schema.parse(getQuery(event))` отдаёт ZodError как 500 вместо 400.

## Проверь себя

- Дата ушла на сервер строкой `YYYY-MM-DD`, а не `toISOString()`?
- Дата с сервера разбирается через `fromDateString`/`toDayKey`/форматтеры, а не `new Date(...).getDate()`?
- Фильтр по timestamp-колонке закрывает последний день (`< to + 1 день`)?
- Ключ кэша содержит период и фильтры и не зависит от порядка элементов?
- Границы периода считает клиент, а не `new Date()` на сервере?
