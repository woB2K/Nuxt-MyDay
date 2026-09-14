---
name: ui-kit-inventory
description: Что уже есть в app/components/ui/ проекта MyDay и с какими пропсами — UiButton, UiInput, UiSheet, UiPillSelect, UiSwipeRow, UiChip, UiRoundBtn, UiEmptyState, UiCheckCircle, UiTxRow, UiTaskRow, UiDateStrip, UiStatsCard, UiTaskTemplateRow, UiCategoryTile, UiSectionHeader, скелетоны. Используй перед вёрсткой любого экрана или компонента, чтобы переиспользовать готовое, а не писать второй такой же.
---

# Инвентарь Ui-компонентов — MyDay

Список актуален на шаг 3.5 (14.09.2026). Если сомневаешься — `ls app/components/ui/` и открой файл: пропсы там на виду, это дешевле, чем угадывать.

Все `Ui*` — без бизнес-логики и без запросов; данные приходят пропсами, наружу идут события. Спеки внешнего вида — в `DESIGN.md`, здесь только API.

## Формы и действия

| Компонент | API | Заметки |
|---|---|---|
| `UiButton` | `size` sm/md/lg (по умолчанию lg), `variant` primary/secondary/ghost/danger, `loading`, `disabled`, `to` | С `to` рендерится `NuxtLink`. `loading` показывает спиннер вместо слота |
| `UiInput` | `v-model`, `label`, `placeholder`, `type` text/password/email/number, `multiline` + `rows`, `error`; слоты `icon`, `trailing` | Для `password` сам рисует кнопку показа. Поля даты — не сюда: нужен нативный `input[type=date]` с `[color-scheme:dark]` |
| `UiPillSelect` | `v-model`, `options: { value, label, color?, inkColor? }[]`, `full`, `bgClass` | `color` красит активную пилюлю (расход — danger, доход — success) |
| `UiDateStrip` | `v-model` (`YYYY-MM-DD` или `''`), `days` (7) | Семь дней от сегодня, горизонтальный скролл. Повторный тап по выбранному дню снимает дату. Отдаёт календарный день строкой, не `Date` |
| `UiSwitch` | `v-model` (boolean) | iOS-стиль, 51×31 |
| `UiChip` | `label`, `count`, `active`, `icon`, `trailingIcon` | Фильтры, быстрые суммы. Счётчик рисуется только при `count > 0` |
| `UiRoundBtn` | `size` (36), `disabled` | Круглая кнопка: назад, стрелки периода, «+» в заголовке секции |
| `UiCheckCircle` | `v-model`, `size` (26), `color` | Внутри строки-кнопки не вкладывать: это `<button>`, оборачивай ряд в `div` и гаси всплытие |
| `UiFab` | событие `click` | Один на экран, живёт в `default.vue`; скрывается через `definePageMeta({ hideFab: true })` |

## Строки и карточки

| Компонент | API | Заметки |
|---|---|---|
| `UiSwipeRow` | `rightAction?: { label, icon, gradient, inkColor }`, `completable`, `deletable` (true), `completed`; события `complete`, `delete` | Порог 90px, ось лочится на первом движении (вертикаль отдаётся скроллу). Правый слой рисуется только при `rightAction` или `completable`. Денежные строки — accent «Edit», зелёный «Done ✓» зарезервирован за задачами |
| `UiTxRow` | `transaction`, `category`, `showDate` (true) | В сгруппированном по дням списке дату выключать. Собственный `border-b` пропадает, если строка — единственный ребёнок обёртки: разделители в таких списках рисуй сам |
| `UiTaskRow` | `task` (с плоскими `tags`), `showDate` (true); события `toggle(done)`, `open` | Строка кликабельна целиком (`open`), чекбокс обёрнут в `@click.stop`. Просроченный дедлайн красится danger. Полоска приоритета справа — цвет из `priorityBarClass` |
| `UiTaskTemplateRow` | `template`; события `use`, `edit` | Тап по строке — `edit`, кнопка «Применить» — `use` (со `@click.stop`) |
| `UiStatsCard` | `type` streak/progress, `value`, `total` (progress) | Подписи свои, через `t('tasks.stats.*')`; стрик плюрализуется. Прогресс не уходит за 100% и не делит на ноль |
| `UiCategoryTile` | `category`, `selected` | Плитка сетки категорий 4 в ряд |
| `UiCategoryBar` | `category`, `amount`, `maxAmount`, `totalAmount` | Строка разбивки расходов с полосой и процентом |
| `UiSavingsCard` | `balance`, `delta`; события `add`, `withdraw` | `balance` — всегда за всё время, `delta` — за выбранный период |
| `UiCard` | `padding` (16), `hero`, `pressable` | Радиус фиксированный (`rounded-2xl`), фон `bg-elev2` или градиент при `hero`. Для списков `:padding="0"` + `class="overflow-hidden border border-hairline"` |
| `UiSectionHeader` | `title`, `caption`; слот `action` | В `action` кладут «See all →», «+» и т.п. |
| `UiEmptyState` | `icon`, `title`, `subtitle`; слот `action` | В `action` — например «Сбросить фильтры» |
| `UiBadge` | `color` accent/success/danger/info/neutral/warning | |

## Оболочки и обратная связь

| Компонент | API | Заметки |
|---|---|---|
| `UiSheet` | `v-model:open`, `title` | Базовый нижний шит: скрим, ручка, блокировка скролла. Все шиты v3 (`PeriodSheet`, `CategoryFilterSheet`, `TransactionEditSheet`, `SavingsOpSheet`) — это контент внутри него, новых базовых шитов не заводим |
| `UiToast` / `UiToastItem` | через `useAppToast()` | Не монтировать вручную — см. skill `ui-feedback-patterns` |
| `UiTabBar` | — | Нижняя навигация, берёт пункты из `app/utils/routes.ts` |
| `UiSkeleton` | `w`, `h` (14), `r` (6) | Плюс готовые `UiSkeletonRow`, `UiSkeletonFinanceHero` |
| `UiLogoMark` | `size` (40) | |

## Куда класть новое

- Переиспользуемое без бизнес-логики → `app/components/ui/UiX.vue`.
- Экранное, знает про запросы и стор → `app/components/features/{finance,tasks,auth,settings}/X.vue` без префикса.
- Автоимпорт настроен с `pathPrefix: false`, поэтому имя файла = имя тега: `PeriodBar.vue` → `<PeriodBar />`.
- Цвета приоритета задач не хардкодим: `priorityBarClass` / `priorityTextClass` из `app/utils/priority.ts`.
- Ещё нет, но по `ROADMAP.md` понадобятся в Фазе 3: `FocusCard`, `TaskSheet`, `TemplateSheet` (это feature-компоненты, не `Ui*`) и скелетон `UiSkeletonTaskRow`.
