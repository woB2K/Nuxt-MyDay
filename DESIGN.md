# DESIGN.md — MyDay Design System

## Обзор

**MyDay** — мобильное приложение (390×844, iPhone-sized). Дизайн iOS-inspired, dark-first с поддержкой светлой темы. Единый акцентный цвет (violet по умолчанию, user-swappable).

Прототип: `design_handoff_myday/prototype/MyDay.html`
Авторизация: `design_handoff_myday/prototype/MyDay Auth.html`
Finance v3 (периоды, фильтры, история): `design_handoff_myday/prototype/MyDay Finance v3.html` — 17 артбордов

---

## Цветовые токены

CSS-переменные: тёмная тема — значения по умолчанию в `:root`, светлая — класс `.light` на `<html>`. Tailwind v4 — конфиг через CSS (`@theme` в `assets/css/main.css`), без `tailwind.config.js`.

### Тёмная тема (default)

```css
/* Surfaces */
--c-bg:        #0F0F14;
--c-bgElev1:   #15151C;
--c-bgElev2:   #1C1C25;
--c-bgElev3:   #26262F;
--c-hairline:  rgba(255,255,255,0.06);
--c-hairline2: rgba(255,255,255,0.10);

/* Text */
--c-text:      #F4F4F7;
--c-textDim:   #A1A1AA;
--c-textMute:  #6B6B75;
--c-textGhost: #3F3F47;

/* Accent (violet default) */
--c-accent:     #A78BFA;
--c-accentSoft: rgba(167,139,250,0.14);
--c-accentInk:  #0F0F14;

/* Semantic */
--c-success:   #34D399;
--c-warning:   #FBBF24;
--c-danger:    #F87171;
--c-info:      #60A5FA;

/* Priority */
--c-pHigh: #F87171;
--c-pMed:  #FBBF24;
--c-pLow:  #60A5FA;
--c-pNone: #6B6B75;
```

### Светлая тема

```css
/* Surfaces */
--c-bg:        #F4F4F8;
--c-bgElev1:   #FFFFFF;
--c-bgElev2:   #EBEBF0;
--c-bgElev3:   #DFDFE8;
--c-hairline:  rgba(0,0,0,0.06);
--c-hairline2: rgba(0,0,0,0.10);

/* Text */
--c-text:      #0F0F14;
--c-textDim:   #4A4A58;
--c-textMute:  #8A8A98;
--c-textGhost: #BABABC;

/* Accent (darkened для WCAG AA на светлом фоне) */
--c-accent:     #6D3FD4;
--c-accentSoft: rgba(109,63,212,0.10);
--c-accentInk:  #FFFFFF;

/* Semantic */
--c-success:   #059669;
--c-warning:   #D97706;
--c-danger:    #DC2626;
--c-info:      #2563EB;
```

### Альтернативные акценты (theme picker)

| Имя | Тёмная тема | Светлая тема |
|-----|------------|-------------|
| Violet (default) | `#A78BFA` | `#6D3FD4` |
| Teal | `#2DD4BF` | `#0D9488` |
| Amber | `#F59E0B` | `#B45309` |
| Sky | `#38BDF8` | `#0284C7` |
| Rose | `#FB7185` | `#E11D48` |

---

## Типографика

| Токен | Size | LH | Weight | Tracking | Использование |
|-------|------|----|--------|----------|---------------|
| hero | 56 | 60 | 700 | -0.03em | Баланс/сумма (Finance hero) |
| title1 | 34 | 40 | 700 | -0.02em | Заголовки страниц |
| title2 | 28 | 34 | 700 | -0.02em | Заголовок фокус-задачи |
| title3 | 22 | 28 | 600 | -0.01em | Заголовки секций |
| headline | 17 | 22 | 600 | -0.01em | Названия задач, элементы списка |
| body | 17 | 24 | 400 | -0.01em | Основной текст |
| callout | 16 | 21 | 500 | -0.005em | Кнопки |
| sub | 15 | 20 | 400 | 0 | Подтекст |
| footnote | 13 | 18 | 500 | 0 | Мета, временные метки |
| caption | 12 | 16 | 500 | 0.01em | Мелкие лейблы |
| overline | 11 | 14 | 600 | 0.08em | UPPERCASE section labels |

**Display font:** SF Pro Display / `-apple-system, system-ui, sans-serif` — заголовки, числа
**Body font:** Inter / `-apple-system, system-ui, sans-serif` — текст, кнопки
**Mono font:** SF Mono / `ui-monospace` — только табличные числа

---

## Спейсинг и радиусы

**Спейсинг:** 4px base. Основные значения: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
Page padding: `20px` horizontal. Card inner padding: `16px`. Min hit target: `44px`.

| Токен | px | Использование |
|-------|----|---------------|
| radius-sm | 8 | кнопки |
| radius-md | 12 | инпуты |
| radius-lg | 16 | карточки |
| radius-xl | 20 | hero-карточки |
| radius-2xl | 24 | bottom sheet (верхние углы) |
| radius-full | 9999 | pills, FAB, аватары, чекбоксы |

---

## Motion

```
ease-out:    cubic-bezier(0.22, 1, 0.36, 1)       выходы
ease-inOut:  cubic-bezier(0.65, 0, 0.35, 1)       смена состояния
ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)    нажатия/масштаб

dur-fast:  150ms   нажатие кнопки, scale
dur-base:  240ms   большинство переходов
dur-slow:  360ms   fade контента вкладок
dur-sheet: 420ms   открытие/закрытие bottom sheet
```

---

## Экраны

| # | Экран | Маршрут | Layout |
|---|-------|---------|--------|
| 1 | Welcome | `/auth/welcome` | auth |
| 2 | Sign In | `/auth/login` | auth |
| 3 | Create Account | `/auth/register` | auth |
| 4 | PIN Lock | `/auth/pin` | fullscreen overlay (поверх всего) |
| 5 | Today | `/today` | default |
| 6 | All Tasks | `/tasks` | default |
| 7 | Task Templates | `/tasks/templates` | default (sub-page) |
| 8 | Finance | `/finance` | default — заголовок + PeriodBar + hero (net за период) + UiPillSelect (Transactions / Savings / Budgets) + контент активного таба |
| 9 | All Transactions | `/finance/transactions` | default (sub-page) — полная история с фильтрами и группировкой по дням |
| 10 | Categories | `/settings/categories` | default (sub-page) |
| 11 | Settings | `/settings` | default |
| 12 | Task Sheet | modal (любая вкладка) | — |
| 13 | Transaction Sheet (create / edit) | modal (Finance, All Transactions) | — |
| 14 | Template Sheet | modal (Templates) | — |
| 15 | Category Edit Sheet | modal (Categories) | — |
| 16 | Period Sheet | modal (все табы Finance + All Transactions) | — |
| 17 | Category Filter Sheet | modal (Transactions, All Transactions) | — |
| 18 | Savings Op Sheet | modal (Savings) | — |
| 19 | Budget Edit Sheet | modal (Budgets) | — (v2) |

---

## Компоненты UI

### Когда использовать что

| Компонент | Использовать когда |
|-----------|-------------------|
| `UiButton primary` | Главное CTA на экране (максимум одна на вид) |
| `UiButton secondary` | Альтернативное действие рядом с primary |
| `UiButton ghost` | Навигационные ссылки, текстовые действия |
| `UiButton danger` | Деструктивные действия (удалить, выйти) |
| `UiCard elev1` | Основные карточки на фоне страницы |
| `UiCard elev2` | Вложенные поверхности внутри elev1 |
| `UiCard hero` | Главная карточка экрана (Finance баланс, Focus задача) |
| `UiBadge accent` | Теги задач, активные состояния |
| `UiBadge success` | Доходы, выполненные задачи |
| `UiBadge danger` | Расходы, высокий приоритет |
| `UiPillSelect` | Сегментированный выбор (All/Open/Done, Expense/Income) |
| `UiEmptyState` | Отсутствие данных в любом списке |
| `UiSheet` | Создание/редактирование любой сущности |
| `UiToast` | Уведомления success/error/warning/info — всегда через `useAppToast()` (имя `useToast` занято Nuxt UI) |
| `UiSkeleton` | Заглушка загрузки — всегда вместо спиннера на уровне элемента |
| `UiSavingsCard` | Hero-карточка накоплений в табе Savings на Finance экране |
| `UiBudgetsSection` | Список бюджетов с прогресс-барами в табе Budgets на Finance экране |
| `PeriodBar` | Выбор периода на всех табах Finance и в All Transactions (v3) |
| `FilterBar` | Фильтры списка транзакций: тип + категории + поиск (v3) |
| `Chip` | Компактный фильтр/quick-amount: чип 36px с бейджем-счётчиком (v3) |
| `RoundBtn` | Круглая иконочная кнопка 36px: back, шаг месяца, «+» в секциях (v3) |

---

### Базовые компоненты (`components/ui/`)

#### `UiButton`
```
props:
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
  size:    'sm' | 'md' | 'lg'                             (default: 'md')
  icon:    Component                                       (optional, leading)
  full:    boolean                                         (100% width)
  disabled: boolean
  loading: boolean

sizes: sm=36px, md=48px, lg=56px height
press: scale(0.96-0.97), spring, 150ms
```

#### `UiInput`
```
props:
  modelValue: string
  placeholder: string
  label:     string          (optional, above field)
  icon:      Component       (optional, leading)
  trailing:  Component       (optional, e.g. eye toggle)
  type:      string          (default: 'text', supports 'password')
  multiline: boolean
  rows:      number          (default: 3, used when multiline)
  error:     string          (shows below field in danger color)

focus: accent border + accentSoft glow ring
icon color: textMute → accent on focus
```

#### `UiBadge`
```
props:
  color: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  soft:  boolean   (default: true — tinted bg)
  icon:  Component

height: 22px, radius-full, caption font
```

#### `UiPillSelect`
```
props:
  modelValue: string
  options: Array<{ value, label, icon?, color?, inkColor? }>
  full: boolean   (stretch to container width)

active: accent или кастомный color из option
```

#### `UiSwitch`
```
props:
  modelValue: boolean

51×31px, iOS-style toggle
```

#### `UiCheckCircle`
```
props:
  modelValue: boolean
  size:  number   (default: 26)
  color: string   (default: var(--c-accent))

checked: accent fill + accentInk checkmark, spring scale 0.6→1.05→1
```

#### `UiPasswordStrength`
```
props:
  password: string  (вычисляет score внутри)

4 сегмента, цвет: danger(1) → amber(2) → yellow(3) → success(4)
label: Too short / Weak / Fair / Good / Strong
```

#### `UiLogoMark`
```
props:
  size: number   (default: 36)

SVG логотип, accent-gradient фон
```

---

### Составные компоненты

#### `UiCard`
```
props:
  padding:    number    (default: 16)
  radius:     number    (default: 16)
  elev:       1 | 2     (default: 1)
  pressable:  boolean

hero variant: radius=20, padding=20-24, gradient bg (accentSoft → bgElev1)
press: scale(0.98), spring, 150ms
```

#### `UiSheet`
```
props:
  open:  boolean
  title: string

структура: scrim + sheet (bgElev2, radius-2xl top)
open/close: translateY(0|100%), dur-sheet, ease-spring
scrim: rgba(0,0,0,0.6) + blur(8px), 240ms
drag handle: 40×4px, hairline2, radius-full
```

#### `UiSwipeRow`
```
props:
  completed:   boolean
  onComplete:  () => void
  onDelete:    () => void
  rightAction: { label, icon, gradient, inkColor }   (v3, optional —
               переопределяет правый свайп; default — зелёный "Done ✓")

right swipe → rightAction или green check (threshold 90px) → onComplete
left  swipe → red trash (threshold 90px) → onDelete
без onComplete правый слой не рендерится, правый свайп не срабатывает
денежные строки: accent «Edit» (onComplete = открыть редактирование),
  НИКОГДА не зелёный Done — он зарезервирован за завершением задач
spring return below threshold, 280ms
```

#### `UiTaskRow`
```
props:
  task:     Task   (title, time, tags, priority, done)
  onToggle: (id) => void
  onOpen:   (id) => void

layout: [UiCheckCircle] [title + meta] [priority bar 4×32px]
done state: strikethrough + textMute, 200ms ease-inOut
```

#### `UiFocusCard`
```
props:
  task:     Task
  onToggle: (id) => void
  onOpen:   (id) => void

hero card: gradient bg, ambient glow blob, title2, UiCheckCircle size=32
```

#### `UiTxRow`
```
props:
  transaction: Transaction
  category:    Category

layout: [icon в тинтованном квадрате 40px] [note + category·date] [±amount]
income: success color, expense: text color
```

#### `UiCategoryTile`
```
props:
  category: Category
  selected: boolean

64×64 rounded-square, icon + label
selected: accent border 2px + accentSoft fill
```

#### `UiCategoryBar`
```
props:
  category:    Category
  amount:      number
  maxAmount:   number   (для ширины бара относительно максимума)
  totalAmount: number   (для процента от общего)

layout: [icon 36px] [name + progress bar + %] [amount]
```

#### `UiSettingRow`
```
props:
  icon:     Component
  label:    string
  trailing: Component   (Switch, PillSelect, ChevronRight, text)
  last:     boolean     (убирает нижний divider)

icon в bgElev3 квадрате 32px, radius 8
```

#### `UiDateStrip`
```
props:
  modelValue: string   (ISO date или '')

7 дней начиная с сегодня, горизонтальный скролл
selected: accent fill + accentInk text
```

#### `UiStatsCard`
```
props:
  type: 'streak' | 'progress'
  value: number
  total?: number   (только для progress)

streak: flame icon + число + "day streak"
progress: число/total + horizontal accent bar
```

#### `UiTaskTemplateRow`
```
props:
  template: TaskTemplate
  onUse:    (id) => void
  onEdit:   (id) => void

layout: [title + priority + tags] [Use button]
```

---

### Лэйаутные компоненты

#### `UiSectionHeader`
```
props:
  title:   string
  caption: string     (optional, "· 3 open")
  icon:    Component  (optional)
  action:  Component  (optional, trailing slot)

overline style: 13px/600/uppercase/+0.08em, textDim
padding: 20px top, 12px bottom
```

#### `UiTabBar`
```
props:
  modelValue: 'today' | 'tasks' | 'finance' | 'settings'

height: 84px + 34px safe-bottom
bg: rgba(15,15,20,0.85) + blur(24px) + top hairline
active: accent icon + accentSoft circle bg (40px, spring scale-in)
inactive: icon + label в textMute
```

#### `UiFab`
```
56×56px, radius-full, accent fill
position: absolute, right 20, bottom 100
shadow: glow tinted with accent
press: scale(0.9), spring
```

#### `UiEmptyState`
```
props:
  icon:     Component
  title:    string
  subtitle: string  (optional)

icon в bgElev2 circle 64px, title 18/600, subtitle 14/400/textDim
```

#### `UiAuthLayout`
```
ambient glow blob: radial-gradient accent, heavily blurred
используется как обёртка для auth страниц
```

#### `UiWelcomeSheet`
```
статический bottom sheet (не модальный, height ~52%)
bgElev1, radius-2xl top, shadow-sheet
содержит: заголовок + OAuth кнопки + divider + email button + footer
```

---

### Компоненты Фазы 2 (`screens-v2.jsx` + `ui-toast-skeleton.jsx`)

#### `UiPinScreen`
```
props:
  length:    number      (default: 4)
  mode:      'unlock' | 'set'   (unlock = вход, set = создание PIN)
  error:     string      (caption под точками, danger цвет)
  onUnlock:  (pin: string) => boolean | void
             (return false → shake + clear, return true или void → success)
  onForgot:  () => void  (только в режиме unlock)

layout: ambient glow (radial accent, blur 20px) + lock icon 56px accentSoft circle
  + title 26/700 + subtitle 14/400/textDim
dots: 16×16px, radius-full, border 1.5px
  empty: transparent + rgba(255,255,255,0.18) border
  filled: accent fill + scale(1.1) spring
  error: danger fill
shake: pinShake keyframes (translateX ±2-8px), 460ms
keypad: grid 3×3 + empty + 0 + backspace, gap 16, padding 0 32px 28px
PinKey: aspectRatio 1.4/1 minHeight 56, radius 16, font display 28/500
  press: bgElev3 + scale(0.95) spring
```

#### `UiSettingsFull` (полная версия Settings)
```
Секция Appearance (UiCard padding=16):
  Theme: overline label + UiPillSelect full [Light | Dark | System]
  Accent: overline label + 5 кнопок-кружков 40px radius-full
    active: box-shadow = 0 0 0 3px bg, 0 0 0 5px {color} + scale(1.06) + checkmark #0F0F14 20px

Секция Preferences (UiCard padding=0):
  Notifications → Switch
  Language → inline EN/RU switcher (bgElev3 pill, accent active)
  Categories → шеврон (открывает /settings/categories)
  Task templates → шеврон (открывает /tasks/templates)

Секция Privacy (UiCard padding=0):
  PIN Lock → Switch + sub "Require PIN to open the app"
  Change PIN → шеврон (только если pinOn = true, анимируется появление)

Секция Account:
  Help & feedback → шеврон

Sign out: отдельная кнопка, ширина 100%, height 52px, radius 12
  bg: rgba(248,113,113,0.10), color: var(--c-danger), font 16/600

SettingRow обновлён: добавлено поле sub (subtitle 12/400/textMute) + onClick
```

#### `UiTemplatesScreen`
```
props:
  templates:  TaskTemplate[]
  onUse:      (t) => void
  onEdit:     (t) => void
  onAdd:      () => void
  onBack:     () => void

layout: back button (chevron-left, 36px circle transparent) + h1 + subtitle
template row: padding 14/16, radius 16, bgElev1 + hairline border, cursor pointer
  priority bar: 4×36px radius-full, цвет из c-pHigh/pMed/pLow/textMute
  tags: 11/500 textDim, padding 2/7px, radius 4, rgba(255,255,255,0.05) bg
  Use кнопка: accent, h=32px, padding 0 14px, radius 8, font 13/700

empty state: UiEmptyState (IconRepeat)
```

#### `UiTemplateSheet`
```
props:
  open:      boolean
  template:  TaskTemplate | null  (null = создание)
  onClose:   () => void
  onSave:    (t) => void
  onUse:     (t) => void  (только при редактировании)

отличия от TaskSheet: нет deadline, нет repeat
кнопки при редактировании: [Save secondary] + [Use template primary full]
кнопка при создании: [Save primary full]
```

#### `UiSavingsCard`
```
props:
  balance:       number
  monthlyDelta:  number  (прирост за месяц, показывается как зелёный badge)
  goal:          number
  lang:          'en' | 'ru'

hero card: gradient teal (rgba(94,234,212,0.10) → bgElev1) + teal border 20%
ambient glow: teal circle top-right, blur 30px, opacity 6%
monthlyDelta badge: accentSoft green bg, success color, формат "+$320"
progress bar: height 8, gradient 90deg #5EEAD4 → accent
action buttons: [Add ↑ success icon] [Withdraw ↓ warning icon]
  каждый flex:1, height 44, radius 10, bgElev2 bg
```

#### `UiBudgetsSection`
```
props:
  budgets:      Array<{ catId, limit }>
  transactions: Transaction[]

строка бюджета: 40px tinted icon + name + spent/limit + progress bar + %
  over budget: bar цвет danger, text danger
  normal: bar цвет категории, text textMute
прогресс-бар: height 6, capped at 100%
```

#### `UiCategoriesScreen`
```
props:
  categories: Category[]
  onAdd:      () => void
  onEdit:     (c) => void
  onDelete:   (id) => void
  onBack:     () => void

layout: back button + add button (accent, 36px circle, top-right) + h1 + subtitle
каждая строка: UiSwipeRow (delete) + карточка (edit on tap)
  40px tinted icon + name 15/600 + kind label 12/textMute + шеврон
hint: "Swipe left to delete" под заголовком
```

#### `UiCategoryEditSheet`
```
props:
  open:      boolean
  category:  Category | null
  onClose:   () => void
  onSave:    ({ name, color, iconKey, kind, id }) => void

preview: 80×80px circle (color+22 bg), активная иконка, radius 20, анимируется при смене
name: UiInput с label
type: UiPillSelect full [Expense danger | Income success]
icon grid: 6 колонок × 2 ряда, 12 иконок (Fork, Cart, Home, Car, Film, Heart, Book, Gift, Briefcase, Sparkle, Tag, Wallet)
  active: color+22 bg + scale(1.05)
color picker: 8 кружков 36px
  palette: #F87171 #FBBF24 #34D399 #5EEAD4 #60A5FA #A78BFA #F472B6 #FB923C
  active: ring (0 0 0 2.5px bgElev1, 0 0 0 4.5px color) + scale(1.08) + checkmark
```

---

### Toast и Skeleton

#### `UiToast` / `UiToastStack`
```
Imperative API (через useToast composable):
  toast.success('text')  → success: зелёный bg, тёмный текст
  toast.error('text')    → error: danger bg, белый текст
  toast.warning('text')  → warning: warning bg, тёмный текст
  toast('text')          → info: bgElev2 + hairline border

ToastStack:
  position: absolute left/right 16px, bottom 100px (над TabBar), z-index 60
  стек растёт снизу вверх, gap 8px

Toast анимация: translateY(20px)→0 + opacity 0→1, dur-base, ease-spring
auto-dismiss: 3000ms (настраиваемо через duration)
опциональный action: кнопка справа (uppercase, 13/700)
icon: 18px — check (success), ×× (error), треугольник ! (warning)
```

#### `UiSkeleton` / `UiSkeletonTaskRow` / `UiSkeletonTxRow` / `UiSkeletonFinanceHero`
```
Skeleton base:
  gradient: rgba(255,255,255,0.04) → 0.10 → 0.04, backgroundSize 200%
  animation: shimmer 1.4s ease-in-out infinite (backgroundPosition 200%→-200%)
  props: w, h (default 14), r (default 6)

SkeletonTaskRow: circle 26px + строка 70% + строка 40% + бар 4×32
SkeletonTxRow: квадрат 40px + строка 55% + строка 32% + блок 70px
SkeletonFinanceHero: label 110px + big block 60%×42 + прогресс-бар + две подписи
```

---

## Компоненты Фазы 3 — Finance периоды и фильтры

Файлы: `finance-filters.jsx` (период + фильтры) и `finance-screens-v3.jsx` (экраны). Прототип: `MyDay Finance v3.html`, 17 артбордов.

Закрывает структурный пробел: Finance показывал только текущий месяц — не было смены периода, полной истории транзакций, фильтров, редактирования, истории накоплений и создания бюджета.

**Все шиты v3** (PeriodSheet, CategoryFilterSheet, TransactionEditSheet, SavingsOpSheet, BudgetEditSheet) — это feature-компоненты, чей контент рендерится внутри базового `UiSheet` (как уже сделан `AddTransactionSheet`). Новые базовые шит-компоненты не нужны.

📦 **Budgets отложены до v2** (решение 28.07.2026, см. CLAUDE.md → Фаза 7): спеки BudgetsTab/BudgetEditSheet ниже — референс для v2. Вопрос модели (помесячная `Budget.month` в БД vs повторяющийся лимит на категорию в дизайне) решается на старте v2 (шаг 7.1). Таб Budgets в `UiPillSelect` до v2 скрыт.

i18n: все строки экранов (en/ru) уже собраны в объекте `L3` в `finance-screens-v3.jsx` — перенести в `i18n/locales/*.json`, не переводить заново.

### Модель периода

```
period = { mode: 'month' | 'range' | 'all', month?: Date, from?: ISO, to?: ISO, preset?: string }

Пресеты: thisMonth, lastMonth (mode month) · last3, thisYear (mode range) · all
periodRange(period) → { from, to } | null (для all)
```

Клиент вычисляет `from`/`to` и передаёт в query; `all` — запрос без параметров. Ровно контракт шага **2.17** из CLAUDE.md. Объект периода живёт в `financeStore` (client state), заменяя `currentMonth`.

### `PeriodBar`

```
props:
  period:      Period
  onChange:    (period) => void   (шаг месяца стрелками)
  onOpenSheet: () => void

layout: [RoundBtn ‹] [центральная кнопка flex:1 h44 r12] [RoundBtn ›]
центр: IconCalendar 16 accent + main 15/600 (ellipsis, max 190px) + sub 11/500 textMute + chevron-down
подписи: month → «July 2026» / «1–31 Jul»; range → «1 May – 31 Jul» / Preset|Custom range; all → «All time»
стрелки шагают месяц за месяцем, disabled вне mode 'month' (opacity 0.35)
tap по центру → PeriodSheet
позиция: под заголовком страницы, над hero; есть на всех трёх табах Finance и в All Transactions
```

### `PeriodSheet`

```
props: open, period, onApply(period), onClose

список 5 пресетов (bgElev2 r12, разделители hairline):
  This month / Last month / Last 3 months / This year / All time
  active: label accent 600 + IconCheck 18 accent
блок «Custom range» — toggle-строка (active: accentSoft + accent border, chevron поворачивается)
  раскрыт: два input[type=date] From/To (h48 r12, colorScheme dark) + Button full «Apply range»
выбор пресета применяется сразу (без кнопки)
```

### `FilterBar`

```
props: type, onType, cats, onOpenCats, search, onSearch

row 1: UiPillSelect full — All / Expense (danger) / Income (success)
row 2 (горизонтальный скролл): Chip «Categories» (+count badge) → CategoryFilterSheet,
  Chip «Search», текстовая кнопка «Reset» (появляется при любом активном фильтре)
поле поиска открывается НАД рядом чипов (h40, accent border + accentSoft glow, autofocus,
  clear-кнопка 22px bgElev3) — чтобы активный фильтр категорий и Reset оставались видимыми
placeholder: «Search notes» — поиск по заметке
```

### `Chip` (новый базовый)

```
props: label, count?, active, icon?, trailing?, onClick

h36, radius-full, padding 0 12, font body 13/600
default: bgElev1 + hairline border + textDim
active:  accentSoft bg + accent border + accent text
count badge: 18px accent circle, accentInk, 11/700
press: scale(0.96) spring
```

### `RoundBtn` (новый базовый)

```
props: size (default 36), disabled, onClick

круг, bgElev1 + hairline border, иконка textDim
press: bgElev3 + scale(0.94) spring · disabled: opacity 0.35
используется: back-кнопка, стрелки PeriodBar, «+» в SectionHeader
```

### `CategoryFilterSheet` (multi-select)

```
props: open, selected: string[], onApply(ids), onClose

строка: 36px tinted icon (color+22) + name 15/600 + kind label 12 textMute + UiCheckCircle 22
выбранная: accentSoft bg + accent border
кнопки: [Clear · secondary · flex 1] [Show · N · primary · flex 2]  («Show all» если пусто)
```

### Finance hero (v3, period-aware)

```
Вместо «текущего баланса» — итог за выбранный период:
overline «NET THIS PERIOD» + сумма 44/700 (-0.03em); danger цвет если net < 0
stacked bar h10 radius-full: доли income (success) и expense (danger)
легенда: точка 8px + label 12 textDim + сумма 13/600
фон: gradient accentSoft → bgElev1, ambient accent glow, как раньше
```

### All Transactions (`/finance/transactions`)

```
sub-page: RoundBtn back + h1 30/700 «Transactions» + subtitle «N operations»
PeriodBar + FilterBar (тот же period/filter state, что на главной — передаётся при переходе)
ResultSummary strip: bgElev2 r12 — «N operations» + «+income» success + «−expense» danger
список сгруппирован по дням:
  sticky заголовок дня (bg страницы, z2): overline 11/600 uppercase + дневной net справа
    (success если ≥ 0, textMute если < 0) · подписи: Today / Yesterday / «18 Jul, Sat»
  карточка дня: bgElev1 + hairline border, r16, строки через UiSwipeRow
    rightAction = accent «Edit» (открывает TransactionEditSheet), левый свайп — delete
  divider между строками: 1px hairline, marginLeft 66
пустой результат: EmptyState (search icon) + Button secondary sm «Clear filters»
точка входа: «See all →» (13/700 accent) в UiSectionHeader секции Recent на главной Finance
```

### `TransactionEditSheet` (dual-mode: create / edit)

```
props: open, tx (null → создание), onSave, onDelete, onClose
title: «New transaction» | «Edit transaction»

type: UiPillSelect full Expense (danger) / Income (success); смена типа сбрасывает категорию
сумма: по центру, 48/700 (-0.03em), $ префикс 34/700 textMute; income → success цвет
категории: grid 4 колонки, фильтр по kind типа; active: color+22 bg + color border + scale(1.03)
note: UiInput с label
date: input[type=date] h48 r12 colorScheme dark  ← новое поле (бэкдейт транзакций)
кнопка: Save full lg
режим edit: + кнопка «Delete transaction» — danger-soft (rgba(248,113,113,0.10)), h48, IconTrash
заменяет прежний AddTransactionSheet (создание — частный случай)
```

### Savings tab (v3 — история)

```
hero UiSavingsCard как раньше (teal gradient, goal, прогресс), изменения:
  delta badge — прирост за ВЫБРАННЫЙ период (UiBadge success «+$270» / danger при минусе)
  кнопки Add ↑ / Withdraw ↓ → SavingsOpSheet (mode deposit | withdraw)
ниже: PeriodBar + UiSectionHeader «History» (caption = count)
строка истории: 40px tinted circle
  deposit:    rgba(52,211,153,0.14) + IconArrowUp success,   сумма «+…» success
  withdrawal: rgba(251,191,36,0.14) + IconArrowDown warning, сумма «−…» warning
  note 15/600 + «Add|Withdraw · date» 12 textMute
баланс — ВСЕГДА total за всё время; период влияет только на историю и delta badge
empty state: wallet icon + «No savings yet» + Button sm «Add»
```

### `SavingsOpSheet`

```
props: open, mode: 'deposit' | 'withdraw', balance, onSave, onClose
title: «Add to savings» | «Withdraw from savings»

сумма по центру 48/700: deposit → success, withdraw → warning
под суммой: «Available · $X» 12 textMute
quick amounts: Chip [50 100 250 500] со знаком по режиму (+$50 / −$50)
note: UiInput
кнопка: Add | Withdraw full lg
заменяет прежний AddSavingsSheet (двунаправленный)
```

### Budgets tab (v3)

```
PeriodBar (см. открытый вопрос про модель Budget выше)
Total card (r20 p20): overline «TOTAL BUDGET» + «$X left» 12 textMute справа
  spent 32/700 + «/ $limit» 14 textMute · общий прогресс h8 (accent, danger при перерасходе)
UiSectionHeader «Budgets» (caption = count) + RoundBtn «+» (accent plus) → BudgetEditSheet
строка бюджета (UiCard p14 r16, pressable → BudgetEditSheet):
  40px tinted icon + name 15/600 + «$spent / $limit» 13/600 (danger при over)
  прогресс h6: цвет категории, danger при over · справа «NN%» или «$X over» danger
  chevron-right 16 textGhost
empty state: flag icon + «No budgets set» + Button sm «Set a budget»
```

### `BudgetEditSheet`

```
props: open, budget (null → создание), onSave({catId, limit}), onDelete, onClose
title: «Set a budget» | «Edit budget»

категории: grid 4 колонки — ТОЛЬКО expense-категории
limit: по центру 44/700, label «MONTHLY LIMIT» overline
пресеты: Chip [100 250 400 600]
hint-строка: bgElev2 r12 — IconWallet + «Spent this month» + сумма (danger если > limit)
кнопка: Save full lg · режим edit: + «Remove budget» danger-soft h48
```

### Новые empty states

Все через `UiEmptyState` + опциональная action-кнопка: нет транзакций в периоде («No transactions yet»), ничего не найдено фильтрами («Nothing matches» + Clear filters), нет накоплений, нет бюджетов.

