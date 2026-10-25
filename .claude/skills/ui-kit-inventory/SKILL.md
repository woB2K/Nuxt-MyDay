---
name: ui-kit-inventory
description: Что уже есть в app/components/ui/ проекта MyDay и с какими пропсами — UiButton, UiInput, UiSheet, UiPillSelect, UiSwipeRow, UiChip, UiRoundBtn, UiEmptyState, UiCheckCircle, UiTxRow, UiTaskRow, UiDateStrip, UiStatsCard, UiTaskTemplateRow, UiCategoryTile, UiSectionHeader, кольца и отметки привычек (UiHabitRing, UiHabitCheck, UiWeekDots, UiStreakTag), скелетоны. Используй перед вёрсткой любого экрана или компонента, чтобы переиспользовать готовое, а не писать второй такой же.
---

# Инвентарь Ui-компонентов — MyDay

Список актуален на B.18 (15.10.2026). Если сомневаешься — `ls app/components/ui/` и открой файл: пропсы там на виду, это дешевле, чем угадывать.

Все `Ui*` — без бизнес-логики и без запросов; данные приходят пропсами, наружу идут события. Спеки внешнего вида — в `DESIGN.md`, здесь только API.

## Формы и действия

| Компонент | API | Заметки |
|---|---|---|
| `UiButton` | `size` sm/md/lg (по умолчанию lg), `variant` primary/secondary/ghost/danger/destructive, `loading`, `disabled`, `to` | С `to` рендерится `NuxtLink`. `loading` показывает спиннер вместо слота |
| `UiInput` | `v-model`, `label`, `placeholder`, `type` text/password/email/number, `multiline` + `rows`, `error`; слоты `icon`, `trailing` | Для `password` сам рисует кнопку показа. Поля даты — не сюда, а в `UiDateInput` |
| `UiDateInput` | `v-model` (`YYYY-MM-DD`), классы пробрасываются на `input` | Нативный `input[type=date]`, голый `<input type="date">` не пишем: на десктопе Chrome открывает календарь только по иконке, а этот — кликом по всему полю (`showPicker()` при `pointer: fine`) |
| `UiAmountInput` | `v-model` — строка `'245000.5'` (точка, без пробелов; `Number()` даёт сумму) | Большое поле суммы в шитах денег. Показывает с разрядами (`245 000,5`), принимает `,` и `.`, держит каретку на месте, ширина по содержимому. Размер и цвет шрифта — классами снаружи |
| `UiPillSelect` | `v-model`, `options: { value, label, color?, inkColor? }[]`, `full`, `bgClass` | `color` красит активную пилюлю (расход — danger, доход — success) |
| `UiDateStrip` | `v-model` (`YYYY-MM-DD` или `''`), `days` (7) | Семь дней от сегодня, горизонтальный скролл. Повторный тап по выбранному дню снимает дату. Отдаёт календарный день строкой, не `Date` |
| `UiSwitch` | `v-model` (boolean) | iOS-стиль, 51×31 |
| `UiChip` | `label`, `count`, `active`, `icon`, `trailingIcon`, слот `#leading` | Фильтры, быстрые суммы. Счётчик рисуется только при `count > 0`. `#leading` заменяет иконку (аватар 20 в чипе «Участники») и ужимает левый отступ |
| `UiRoundBtn` | `size` (36), `disabled` | Круглая кнопка: назад, стрелки периода, «+» в заголовке секции |
| `UiCheckCircle` | `v-model`, `size` (26), `color` | Внутри строки-кнопки не вкладывать: это `<button>`, оборачивай ряд в `div` и гаси всплытие |
| `UiFab` | событие `click` | Один на экран, живёт в `default.vue`; скрывается через `definePageMeta({ hideFab: true })` |

## Строки и карточки

| Компонент | API | Заметки |
|---|---|---|
| `UiSwipeRow` | `rightAction?: { label, icon, gradient, inkColor }`, `completable`, `deletable` (true), `completed`; события `complete`, `delete` | Порог 90px, ось лочится на первом движении (вертикаль отдаётся скроллу). Правый слой рисуется только при `rightAction` или `completable`. Денежные строки — accent «Edit», зелёный «Done ✓» зарезервирован за задачами |
| `UiTxRow` | `transaction` (`{ type, amount, notes?, date }`), `category` (`{ icon, color, name, key }`), `showDate` (true), `author` (`TxAuthor` из `authorFor()`), `authorRing` (фон под бейджем), `tags` (имена — из `useFinanceTagNames()`, видно 2 и «+N»), `pending` (офлайн-запись: приглушена, иконка часов) | Узкие типы — чтобы рисовать и тело офлайн-записи из очереди (`PendingTransactions`). В сгруппированном по дням списке дату выключать. Собственный `border-b` пропадает, если строка — единственный ребёнок обёртки: разделители в таких списках рисуй сам |
| `UiTaskRow` | `task` (с плоскими `tags`), `showDate` (true); события `toggle(done)`, `open` | Строка кликабельна целиком (`open`), чекбокс обёрнут в `@click.stop`. Просроченный дедлайн красится danger. Полоска приоритета справа — цвет из `priorityBarClass` |
| `UiTaskTemplateRow` | `template`; события `use`, `edit` | Тап по строке — `edit`, кнопка «Применить» — `use` (со `@click.stop`) |
| `UiStatsCard` | `type` streak/progress, `value`, `total` (progress) | Подписи свои, через `t('tasks.stats.*')`; у стрика подпись «серия задач» — чтобы не путать с огнём привычек. Прогресс не уходит за 100% и не делит на ноль |
| `UiCategoryTile` | `category`, `selected` | Плитка сетки категорий 4 в ряд |
| `UiCategoryBar` | `category`, `amount`, `maxAmount`, `totalAmount` | Строка разбивки расходов с полосой и процентом |
| `UiSavingsCard` | `balance`, `delta`, `sharedWith` (участники — бейдж «Общая»); события `add`, `withdraw` | `balance` — всегда за всё время, `delta` — за выбранный период. Тап по балансу переключает privacy mode, как сумма в hero «Финансов» |
| `UiCard` | `padding` (16), `hero`, `pressable` | Радиус фиксированный (`rounded-2xl`), фон `bg-elev2` или градиент при `hero`. Для списков `:padding="0"` + `class="overflow-hidden border border-hairline"` |
| `UiSectionHeader` | `title`, `caption`; слот `action` | В `action` кладут «See all →», «+» и т.п. |
| `UiEmptyState` | `icon`, `title`, `subtitle`; слот `action` | В `action` — например «Сбросить фильтры» |
| `UiBadge` | `color` accent/success/danger/info/neutral/warning | |
| `UiMoney` | `amount`, `sign` (`'+'`, `'-'`, `'−'`) | Любая сумма на экране. Валюта — из `useCurrency()` (валюта семьи), формат — по языку интерфейса. В privacy mode — плашка-скелетон и символ валюты с его стороны, иначе `{sign}{сумма с символом}` одним текстом |
| `UiAvatar` | `name`, `colorIndex` (0–3, `null` — ушедший автор), `size` (40), `dashed`, `ring` | Цвет участника — токены `m0…m3`. `ring` — цвет фона под аватаром: даёт и обводку, и непрозрачную подложку (иначе в стопке перекрытие просвечивает) |
| `UiAvatarStack` | `members: { name, colorIndex }[]`, `size` (24), `ring` (`var(--c-bg)`) | Перекрытие −30% размера |
| `UiIconDisc` | `icon`, `tone` accent/success/warning/danger/neutral, `size` (36) | Круг с иконкой: шапки шторок, последствия, пункты списков |

## Привычки

Цвет привычки — ключ (`violet`, `teal`…), не hex: компоненты сами берут `var(--c-h-{color})`, `var(--c-h-{color}-soft)` и `var(--c-h-ink)` (иконка на заливке) через `habitColor()` / `habitSoft()` из `app/utils/habits.ts` — так работает светлая тема. Эффекты отметки (`fx: { type: 'on' | 'off' | 'record' | 'wave', key, delay? }`) отдаёт `useHabitMarking()`; новый `key` перезапускает анимацию.

| Компонент | API | Заметки |
|---|---|---|
| `UiHabitRing` | `icon` (имя iconify), `color`, `segments` (1), `filled` (0), `checked`, `size` (56), `label`, `fx`; событие `toggle` | Кольцо + диск из макета привычек. `segments > 1` — недельная: дуга на каждую отметку плана, при `filled >= segments` зазоры закрываются и появляется бейдж-галочка. Диск залит, только когда отмечено сегодня. `fx.type === 'record'` — разлёт точек |
| `UiHabitCheck` | `color`, `checked`, `segments`, `filled`, `size` (30), `label`, `fx`; событие `toggle` | Чекбокс в строке списка, зона 44×44 с отрицательным полем. Клик со `.stop` — строка вокруг не откроется. У недельной вокруг — сегменты 40px |
| `UiWeekDots` | `days: WeekDot[]` (из `weekDots()`), `color`, `weekly` | Мини-история 7 дней, квадраты 8×8. Недельная: пропуск нейтральный, перед понедельником зазор 3px |
| `UiStreakTag` | `value`, `active`, `color`, `label` (длинная форма «12 дней»), `size` (12), `dash` (true), `fx` | Огонь + число. `active` — огонь в цвете привычки, иначе textMute. `value = 0` — «—» или ничего при `dash: false`. На рекорде огонь сменяется кубком |
| `UiSegArcs` | `size`, `stroke`, `segments`, `filled`, `color`, `gap` (4) | Внутренний примитив дуг для кольца и чекбокса. Про недели ничего не знает — пригодится под шаги составной привычки (B.24) |

## Оболочки и обратная связь

| Компонент | API | Заметки |
|---|---|---|
| `UiSheet` | `v-model:open`, `title` (необязательный), слот `#footer` | Базовый нижний шит: скрим, ручка, блокировка скролла. `#footer` липнет к низу шторки поверх контента — для кнопок под длинным списком (`CategoryFilterSheet`, `TagFilterSheet`). Без `title` заголовок не рисуется — для шитов со своей шапкой (`InstallSheet`). Все шиты v3 (`PeriodSheet`, `CategoryFilterSheet`, `TransactionEditSheet`, `SavingsOpSheet`) — это контент внутри него, новых базовых шитов не заводим |
| `UiToast` / `UiToastItem` | через `useAppToast()`; `success(message, { label, run })` добавляет кнопку действия, `info(message, { persistent, action })` — тост без автоскрытия и/или с действием («Привычки скрыты» + «Отменить») | Не монтировать вручную — см. skill `ui-feedback-patterns`. Тост с действием живёт 5 с, действие закрывает тост — так сделано «Отменить» после удаления |
| `UiTabBar` | — | Нижняя навигация, берёт пункты из `app/utils/routes.ts`. Вкладка подсвечивается и на префиксах из `nested`: `/habits` — под-страница «Сегодня» |
| `UiSkeleton` | `w`, `h` (14), `r` (6) | Плюс готовые `UiSkeletonRow`, `UiSkeletonFinanceHero` |
| `UiLogoMark` | `size` (40) | Он же иконка приложения в гайде установки |
| `UiInstallStep` | `n`, `title`, `hint`, `visual`, `label` | Нумерованный шаг инструкции с мини-мокапом справа |
| `UiStepVisual` | `kind` share/menuAdd/menuInstall/add/kebab/install, `label` | Схема 76×56 без привязки к реальному UI браузера. Тип `StepVisualKind` — в `app/utils/pwaInstall.ts` |

## Куда класть новое

- Переиспользуемое без бизнес-логики → `app/components/ui/UiX.vue`.
- Экранное, знает про запросы и стор → `app/components/features/{finance,tasks,habits,auth,settings}/X.vue` без префикса.
- Автоимпорт настроен с `pathPrefix: false`, поэтому имя файла = имя тега: `PeriodBar.vue` → `<PeriodBar />`.
- Суммы на экране — только через `<UiMoney :amount :sign />`, а не `formatAmount(...)` с символом руками, и без зашитого `₽`: символ и формат даёт `useCurrency()` (`money`, `affix` для полей ввода), иначе они не спрячутся в privacy mode (плашка-скелетон). `UiTxRow`, `UiCategoryBar`, `UiSavingsCard`, `TrashRow` уже так делают; для `aria-label` переключателя — `useMoney().toggleLabel()`. Поля ввода (`UiAmountInput`) и подсказки в шитах редактирования не прячем.
- Цвета приоритета задач не хардкодим: `priorityBarClass` / `priorityTextClass` из `app/utils/priority.ts`.
- Гайд установки PWA (`features/install/`): `InstallHint`, `InstallBanner`, `InstallSettingsCard` сами решают, показываться ли (`usePwaInstall`), и каждый держит свой `InstallSheet` — вставлять одной строкой без обёрток.
- `features/settings/TrashRow.vue` — строка корзины (плитка-иконка, заголовок, подпись, сумма). Свайпы — снаружи, в `UiSwipeRow`. Фон плитки по умолчанию — `tileColor` + альфа `33`; для цвета из CSS-переменной передай готовый `tileSoft`.
- Привычки (`features/habits/`): `HabitsTodayBlock` (лента колец на «Сегодня»; сама решает про скелетон, пустой вход и «×»), `HabitRingItem` (кольцо + подпись + серия, удержание 450 мс — `useLongPress`), `HabitRow` (строка списка), `HabitMonthCalendar` (месяц с окном отметки и итогом недели), `HabitStatTile`, `HabitSheet` (создание и правка, без пресетов). Подписи плана и серии — `useHabitLabels()`, руками не собирать. Макет — `design_handoff_myday/design_handoff_habits/`.
- Семья (`features/family/`): шторки `InviteSheet`, `MemberSheet`, `LeaveSheet`, `SavingsModeSheet` строятся из `FamilySheetHead` + `FamilyConsequences`; экраны вступления — `JoinInvite`, `JoinStatus`, `JoinSuccess` с липким `JoinFooter`. Автор операции — `useFamily().authorFor(userId)`, логика в `app/utils/family.ts`.
- Feature-компоненты задач (`features/tasks/`): `FocusCard`, `TaskSheet`, `TemplateSheet`, `TaskFilterBar`, `TagPicker`. Выбор тегов не дублируем — в обоих шитах стоит `<TagPicker v-model="tagIds" />`, он же сам создаёт новые теги. В `TransactionEditSheet` тот же пикер с `kind="finance"` — семейные теги операций.
