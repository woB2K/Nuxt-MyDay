---
name: ui-feedback-patterns
description: UI-паттерны обратной связи в проекте MyDay — переключение тёмной/светлой темы через CSS-класс и Tailwind v4 @theme, глобальный обработчик непойманных ошибок + useAppToast. Используй при работе с темизацией или тостами/уведомлениями об ошибках.
---

# UI Feedback Patterns — MyDay

## Переключение темы

Тёмная тема — значения по умолчанию в `:root` (`assets/css/main.css`), светлая — класс `.light` на `<html>`. Tailwind v4: конфиг через CSS (`@theme` в `main.css`), файла `tailwind.config.js` нет.

```ts
// app/composables/useTheme.ts
export function useTheme() {
  const settings = useSettingsStore()

  function apply(theme: 'dark' | 'light' | 'system') {
    const isDark = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark'
    document.documentElement.classList.toggle('light', !isDark)
  }

  watch(() => settings.theme, apply, { immediate: true })
  // При system: слушать prefers-color-scheme mediaQuery на изменения
}
```

Цветовые токены обеих тем — в `DESIGN.md`.

---

## Глобальный обработчик ошибок

`useAppToast` — composable для показа уведомлений (имя `useToast` занято одноимённым composable из Nuxt UI — поэтому префикс `App`). Очередь тостов живёт в `useUiStore`. `UiToast` компонент рендерится в `app.vue`.

```ts
// Использование в store при откате оптимистичного апдейта:
const { error } = useAppToast()
error('Failed to save task')

// Nuxt hook для непойманных ошибок:
// app/plugins/errorHandler.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err) => {
    useAppToast().error(err.message ?? 'Something went wrong')
  })
})
```
