---
name: auth-security-patterns
description: Паттерны аутентификации и безопасности проекта MyDay — silent refresh при старте приложения, PIN-блокировка (useAppLock), rate limiting на auth-эндпоинтах, проверка userId из JWT-контекста, проверка принадлежности relation-id (categoryId/tagIds) из body запроса. Используй при работе с auth-флоу, защищёнными эндпоинтами, или любым API-хендлером, принимающим id связанных сущностей от клиента.
---

# Auth & Security Patterns — MyDay

## Silent refresh при старте приложения

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

---

## PIN блокировка (useAppLock)

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

См. решение «PIN — UI lock, не второй фактор» в `ARCHITECTURE.md`.

---

## Rate limiting (server/middleware/02.rateLimit.ts)

Защита от брутфорса на auth endpoints. Хранит счётчики попыток в памяти (Map). На проде — заменить на Redis через `unstorage`.

```ts
const attempts = new Map<string, { count: number; resetAt: number }>()

// Применяется только к /api/auth/login и /api/auth/register
// При превышении → throw createError({ statusCode: 429, message: 'Too many requests' })
```

---

## Безопасность: userId всегда из контекста

`userId` всегда берётся из JWT (через `event.context.userId`), никогда из query/body запроса.

```ts
// ❌ Никогда так
const { userId } = await readBody(event)

// ✅ Всегда так
const userId = event.context.userId // проставляет server/middleware/01.auth.ts
```

Иначе любой аутентифицированный пользователь может передать чужой `userId` и получить доступ к чужим данным.

---

## Безопасность: relation id из body проверяются на принадлежность

Продолжение того же правила. `userId` — доверенный (из JWT). Но `categoryId`, `tagIds` и любые другие id связанных сущностей приходят из body — это пользовательский ввод. FK-констрейнт проверит только существование записи, но не владельца: без явной проверки можно привязать свою транзакцию к чужой категории или чужой тег к своей задаче (IDOR).

```ts
// Одиночный id — findFirst с userId в where
const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId } })
if (!category) throw createError({ statusCode: 400, message: 'Unknown category' })

// Массив id — дедуп через Set, затем count и сравнение длин
const ids = [...new Set(body.tagIds)]
const owned = await prisma.tag.count({ where: { id: { in: ids }, userId } })
if (owned !== ids.length) throw createError({ statusCode: 400, message: 'Unknown tag' })
```

Для update/delete самих сущностей принцип уже соблюдается через `where: { id, userId }` (см. `tags/[id].delete.ts`) — здесь то же самое, но для связей. Бонус: явная проверка возвращает 400 вместо 500 от FK-констрейнта при несуществующем id.

Актуальные точки применения: `2.18` (`ROADMAP.md`) для finance, `3.2` для `tagIds` в tasks.
