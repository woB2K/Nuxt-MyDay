---
name: tanstack-query-patterns
description: Паттерны работы с TanStack Query (server state) в проекте MyDay — настройка плагина, централизованные query keys, useQuery/useMutation, оптимистичные апдейты через onMutate/onError/onSettled, структура composables (useFinance.ts, useTasks.ts, useCategories.ts). Используй при добавлении или изменении хуков для серверных данных: transactions, tasks, categories, tags, savings, budgets, templates.
---

# TanStack Query Patterns — MyDay

Устанавливается через `@tanstack/vue-query`. Это Vue-адаптация — та же библиотека что TanStack Query для React, но с Vue Composition API.

Правило разделения состояния (Pinia vs TanStack Query) — в `CLAUDE.md` → «Соглашения». Этот skill — только про то, *как* писать сами TanStack Query хуки.

## Настройка плагина

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

## Query Keys — централизованный файл

Ключи — это идентификаторы кэша. Иерархические: `['transactions']` инвалидирует всё включая `['transactions', { period, filters }]`. Хранить в одном месте чтобы не опечататься.

```ts
// app/composables/queryKeys.ts
export const queryKeys = {
  categories:       ()                                  => ['categories']                             as const,
  transactions:     (period: string, filters: string)   => ['transactions', { period, filters }]      as const,
  transactionPages: (period: string, filters: string)   => ['transactions', 'pages', { period, filters }] as const,
  summary:          (period: string, filters: string)   => ['summary', { period, filters }]           as const,
  savings:          (period: string)                    => ['savings', 'pages', { period }]           as const,
  budgets:          (period: string)                    => ['budgets', { period }]                    as const,
  tasks:            (filter: string, search: string)    => ['tasks', { filter, search }]              as const,
  tags:             ()                                  => ['tags']                                   as const,
  templates:        ()                                  => ['templates']                              as const,
}
```

`period` и `filters` — строки из `periodKey()` и `filterKey()` (`app/utils/period.ts`, `app/utils/transactionFilters.ts`), а не сырые объекты: ключ должен быть стабильным и не зависеть от порядка выбранных категорий. Постраничный список живёт под тем же префиксом `['transactions']`, поэтому инвалидация из мутаций достаёт и его.

## useQuery — чтение данных

```ts
// app/composables/useFinance.ts — границы периода вычисляет клиент (см. «Таймзоны» в ARCHITECTURE.md)
export function useSummaryQuery(period: Ref<Period>, filters: Ref<TransactionFilters>) {
  const api = useApi()
  return useQuery({
    queryKey: computed(() => queryKeys.summary(periodKey(period.value), filterKey(filters.value))), // реактивный ключ
    queryFn: () => api<SummaryResponse>('/api/finance/summary', {
      query: { ...periodRange(period.value), ...filterQuery(filters.value) }
    })
  })
}
```

`periodRange()` отдаёт `null` для режима «всё время» — тогда запрос уходит без `from`/`to`. Список транзакций и summary принимают один и тот же набор фильтров (см. `ARCHITECTURE.md`).

В компоненте:
```ts
const financeStore = useFinanceStore()
const { data, isPending, isError } = useSummaryQuery(
  toRef(financeStore, 'period'),
  toRef(financeStore, 'filters')
)
// При смене периода или фильтров → новый запрос автоматически
// Старый результат закэширован — возврат к периоду = мгновенный ответ
```

## useInfiniteQuery — постраничные списки

Страница All Transactions читает список порциями: ключ отдельный (`transactionPages`), потому что в кэше лежит `{ pages: [...] }`, а не один ответ.

```ts
export function useTransactionPagesQuery(period: Ref<Period>, filters: Ref<TransactionFilters>, limit = 30) {
  const api = useApi()
  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.transactionPages(periodKey(period.value), filterKey(filters.value))),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<TransactionListResponse>('/api/finance/transactions', {
      query: { ...periodRange(period.value), ...filterQuery(filters.value), page: pageParam, limit }
    }),
    getNextPageParam: lastPage =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined
  })
}

// в компоненте: pages.value?.pages.flatMap(p => p.data), hasNextPage, fetchNextPage()
```

## useMutation — мутации с инвалидацией кэша

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
    onError: () => useAppToast().error('Failed to add transaction'),
  })
}
```

## Оптимистичный апдейт через TanStack Query

Встроенный механизм лучше Pinia-паттерна "сохранить/откатить" (см. ниже). **Целевой паттерн для 4.3** (`ROADMAP.md`) — в финансах часть мутаций пока без `onMutate`/rollback, в задачах он уже сделан (`useToggleTaskMutation`, `useDeleteTaskMutation`):

```ts
export function useDeleteTransactionMutation(key: Ref<ReturnType<typeof queryKeys.transactions>>) {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/finance/transactions/${id}`, { method: 'DELETE' }),

    onMutate: async (id) => {
      // Отменить незавершённые запросы чтобы они не перезаписали оптимистичный апдейт
      await queryClient.cancelQueries({ queryKey: key.value })
      // Сохранить текущий кэш для отката
      const previous = queryClient.getQueryData(key.value)
      // Обновить кэш немедленно — UI реагирует до ответа сервера
      queryClient.setQueryData(key.value, (old: any) =>
        old?.data?.filter((tx: Transaction) => tx.id !== id)
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      // Откатить к сохранённому состоянию
      queryClient.setQueryData(key.value, context?.previous)
      useAppToast().error('Failed to delete transaction')
    },
    onSettled: () => {
      // После успеха ИЛИ ошибки — синхронизировать с сервером
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
```

### Один ресурс — несколько закэшированных списков

Пример выше правит один ключ. Списки задач лежат в кэше по каждому набору (фильтр, поиск), поэтому править нужно все сразу — иначе вкладка, открытая с другим фильтром, останется со старой копией. `app/composables/useTasks.ts`:

```ts
async function snapshotTasks(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })
  return queryClient.getQueriesData<TaskItem[]>({ queryKey: ['tasks'] })   // [ключ, данные][]
}

function patchTaskLists(queryClient: QueryClient, patch: (tasks: TaskItem[]) => TaskItem[]) {
  queryClient.setQueriesData<TaskItem[]>({ queryKey: ['tasks'] }, tasks => tasks && patch(tasks))
}

function restoreTaskLists(queryClient: QueryClient, snapshot: TaskListSnapshot = []) {
  snapshot.forEach(([key, tasks]) => queryClient.setQueryData(key, tasks))
}
```

`onMutate` берёт снапшот и применяет `patch`, `onError` восстанавливает его, `onSettled` инвалидирует префикс. Отметка «выполнено» меняет задачу на месте (зачёркивание), а не выбрасывает её из списка `open` — уборку делает рефетч после инвалидации.

Тост на успех — не для каждой мутации: `toggle` срабатывает на каждый тап по чекбоксу, поэтому у него только тост ошибки.

## Оптимистичные апдейты в Pinia (client state, не TanStack)

Для чисто client-state сторов (пока используется в Tasks до перехода на паттерн выше) — паттерн: сохранить предыдущее состояние → обновить UI → сделать запрос → откатить при ошибке.

```ts
async function toggleTask(id: string) {
  const task = tasks.value.find(t => t.id === id)!
  const prev = task.done                    // 1. сохранить
  task.done = !task.done                    // 2. обновить UI немедленно
  try {
    await $fetch(`/api/tasks/${id}`, { method: 'PATCH', body: { done: task.done } })
  } catch {
    task.done = prev                        // 3. откатить при ошибке
    useAppToast().error('Failed to update')
  }
}
```

## Структура composables с TanStack Query

```ts
// app/composables/useFinance.ts — все хуки для finance
export function useTransactionQuery(period: Ref<Period>, filters: Ref<TransactionFilters>) { ... }
export function useTransactionPagesQuery(period, filters, limit?) { ... }  // All Transactions
export function useSummaryQuery(period: Ref<Period>, filters: Ref<TransactionFilters>) { ... }
export function useSavingsQuery(period: Ref<Period>, limit?) { ... }      // тоже постраничный
export function useBudgetQuery(period: Ref<Period>) { ... }
export function useAddTransactionMutation() { ... }
export function useUpdateTransactionMutation() { ... }
export function useDeleteTransactionMutation() { ... }
export function useAddSavingsMutation() { ... }
export function useDeleteSavingsMutation() { ... }
export function useUpsertBudgetMutation() { ... }

// app/composables/useCategories.ts — отдельно, используется в Finance И Settings
export function useCategoriesQuery() { ... }
export function useAddCategoryMutation() { ... }
export function useUpdateCategoryMutation() { ... }
export function useDeleteCategoryMutation() { ... }

// app/composables/useTasks.ts — все хуки для tasks
export function useTasksQuery(filter: Ref<TaskFilter>, search: Ref<string>) { ... }
export function useTagsQuery() { ... }
export function useTemplatesQuery() { ... }
export function useAddTaskMutation() { ... }
export function useUpdateTaskMutation() { ... }
export function useToggleTaskMutation() { ... }   // оптимистичный
export function useDeleteTaskMutation() { ... }   // оптимистичный
```

## useApi — авторизованные запросы с клиента

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
