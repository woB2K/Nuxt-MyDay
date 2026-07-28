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

## useQuery — чтение данных

```ts
// app/composables/useFinance.ts — границы месяца вычисляет клиент (см. «Таймзоны» в ARCHITECTURE.md)
export function useSummaryQuery(month: Ref<Date>) {
  const api = useApi()
  return useQuery({
    queryKey: computed(() => queryKeys.summary(
      `${month.value.getFullYear()}-${String(month.value.getMonth() + 1).padStart(2, '0')}`
    )), // реактивный ключ
    queryFn: () => {
      const y = month.value.getFullYear()
      const m = month.value.getMonth()
      const from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
      const to = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10)
      return api<SummaryResponse>('/api/finance/summary', { query: { from, to } })
    }
  })
}
```

В компоненте:
```ts
const financeStore = useFinanceStore()
const { data, isPending, isError } = useSummaryQuery(
  toRef(financeStore, 'currentMonth')
)
// При смене financeStore.currentMonth → новый запрос автоматически
// Старый результат закэширован — возврат к месяцу = мгновенный ответ
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

Встроенный механизм лучше Pinia-паттерна "сохранить/откатить" (см. ниже). **Целевой паттерн для 4.3** (`ROADMAP.md`) — в текущем коде часть мутаций пока без `onMutate`/rollback:

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
export function useTransactionQuery() { ... }             // + from/to после 2.17
export function useSummaryQuery(month: Ref<Date>) { ... }
export function useSavingsQuery() { ... }
export function useBudgetQuery(month: Ref<Date>) { ... }
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
export function useTasksQuery(filter: Ref<string>, search: Ref<string>) { ... }
export function useTagsQuery() { ... }
export function useTemplatesQuery() { ... }
export function useAddTaskMutation() { ... }
export function useToggleTaskMutation() { ... }
export function useDeleteTaskMutation() { ... }
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
