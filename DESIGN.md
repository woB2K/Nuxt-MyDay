# DESIGN.md — MyDay Design System

## Обзор

**MyDay** — мобильное приложение (390×844, iPhone-sized). Дизайн iOS-inspired, dark-first с поддержкой светлой темы. Единый акцентный цвет (violet по умолчанию, user-swappable).

Прототип: `design_handoff_myday/prototype/MyDay.html`
Авторизация: `design_handoff_myday/prototype/MyDay Auth.html`
Finance v3 (периоды, фильтры, история): `design_handoff_myday/prototype/MyDay Finance v3.html` — 17 артбордов
Семья (v2.0): `design_handoff_myday/MyDay Family export/MyDay Family.html`

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
--c-field:     #26262F;   /* поверхность полей ввода — на ступень светлее шита */
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
--c-successSoft: rgba(52,211,153,0.14);
--c-warningSoft: rgba(251,191,36,0.14);
--c-dangerSoft:  rgba(248,113,113,0.10);

/* Участники семьи — по colorIndex, Soft = alpha 0.18 */
--c-m0: #5EEAD4;  --c-m0Soft: rgba(94,234,212,0.18);
--c-m1: #F472B6;  --c-m1Soft: rgba(244,114,182,0.18);
--c-m2: #FBBF24;  --c-m2Soft: rgba(251,191,36,0.18);
--c-m3: #60A5FA;  --c-m3Soft: rgba(96,165,250,0.18);

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
--c-field:     #FFFFFF;   /* поверхность полей ввода — белая на сером шите */
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
--c-successSoft: rgba(5,150,105,0.10);
--c-warningSoft: rgba(217,119,6,0.10);
--c-dangerSoft:  rgba(220,38,38,0.08);

/* Участники семьи — Soft = alpha 0.12 */
--c-m0: #0F766E;  --c-m0Soft: rgba(15,118,110,0.12);
--c-m1: #BE185D;  --c-m1Soft: rgba(190,24,93,0.12);
--c-m2: #B45309;  --c-m2Soft: rgba(180,83,9,0.12);
--c-m3: #1D4ED8;  --c-m3Soft: rgba(29,78,216,0.12);
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
| `InstallHint` / `InstallBanner` / `InstallSettingsCard` | Точки входа в гайд по установке PWA: Welcome, Today, Settings |
| `UiInstallStep` + `UiStepVisual` | Нумерованный шаг инструкции со схематичным мини-мокапом |

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

Секция About (UiCard padding=0), над Sign out:
  What's new → icon sparkles + sub "Version X.Y.Z" + шеврон (открывает /settings/changelog)

Sign out: отдельная кнопка, ширина 100%, height 52px, radius 12
  bg: rgba(248,113,113,0.10), color: var(--c-danger), font 16/600

SettingRow обновлён: добавлено поле sub (subtitle 12/400/textMute) + onClick
```

#### `ChangelogScreen` (`/settings/changelog`)
```
layout как у Categories: UiRoundBtn назад (chevron-left) + h1 "What's new" + sub "Current version X.Y.Z" (14/400/textDim)

карточка релиза: UiCard padding=16, gap 12, по одной на версию, новые сверху
  шапка: версия 17/700/text + title релиза 14/400/textDim (truncate) ··· дата 12/400/textMute справа (DD.MM.YYYY)
  строка изменения: бейдж типа + текст 14/400/text, gap 10, между строками 10
    бейдж: w 84, radius 6, padding 2/0, font 11/600, текст по центру
      New       → bg accentSoft, color accent
      Improved  → bg info/15%, color info
      Fixed     → bg elev3, color textDim

тексты берутся из shared/changelog.ts на языке интерфейса; через t() — только заголовок, подпись и бейджи
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
  FAB на время показа поднимается над стеком (+12px), вниз — когда стек пуст
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
period = { mode: 'month' | 'range' | 'all', month?: ISO, from?: ISO, to?: ISO, preset?: string }

Пресеты: thisMonth, lastMonth (mode month) · last3, thisYear (mode range) · all
periodRange(period) → { from, to } | null (для all)
```

Реализовано в `app/utils/period.ts` (шаг 2.19) как размеченное объединение по `mode`, а `month` — date-only строка (первое число месяца), а не `Date`: весь календарный контракт проекта строковый (см. `ARCHITECTURE.md`), объект периода целиком сериализуем и годится в ключ TanStack Query (`periodKey`).

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

---

## Гайд по установке PWA (B.4)

Прототип: `design_handoff_myday/prototype/MyDay Install Guide.html`. Правила показа и хранение — в `ARCHITECTURE.md` → «Гайд по установке PWA».

### Точки входа

```
только телефон в браузере, вне standalone (iPad и Android-планшеты исключены)

InstallHint (Welcome, под слоганом) — не закрывается
  кнопка-карточка: min-h 56, r16, bgElev1, border hairline2, padding 10 12 10 10
  [квадрат 36 r10 accentSoft + download 18 accent] · title 15/600 + sub 13/500 textDim · chevron 18 textMute

InstallBanner (Today, между приветствием и статистикой)
  r16, border accentSoft, bg linear-gradient(135deg, accentSoft 0%, bgElev1 70%), padding 16
  UiLogoMark 44 · title 17/600 display + body 13/500 textDim + UiButton primary sm «How to install»
  крестик: зона 44, видимый круг 28 bgElev3, aria-label install.banner.dismiss
  скрытие: 1-е закрытие → 14 дней, 2-е → 30, 3-е → навсегда

InstallSettingsCard (Settings, под профилем)
  UiCard padding 0 + UiSettingRow (download, label + sub, chevron)
```

### `InstallSheet`

```
props: open, context: 'welcome' | 'today' | 'settings'
state: guide | prompting | success
контент UiSheet без title (своя шапка):
  крестик: зона 44, круг 32 bgElev3
  шапка: UiLogoMark 52 · title 22/600 display + subtitle 15 textDim
  welcome + iOS: заметка r12 accentSoft (info 18 accent + 13/500 text) — почему ставить до входа
  преимущества: grid 2×2, круг 28 accentSoft + иконка 16 accent, текст 13/500 textDim
    maximize · layout-grid · zap · wifi-off
  тело по варианту (overline 11/600 uppercase 0.08em textMute над шагами):
    iOS Safari        → 3 шага: share → menuAdd → add
    iOS другой браузер → те же шаги + карточка «Открой в Safari» + UiButton secondary sm «Copy link»
    Android с промптом → UiButton primary lg full «Install» + hint 13 textMute
    Android без промпта → (после отказа — пояснение) + 3 шага: kebab → menuInstall → install
    платформа не определена → UiPillSelect iPhone | Android (bg-elev1) + шаги выбранной
  футер: UiButton ghost md full «Not now»
success: мини-экран «Домой» (3 заглушки 52 r14 bgElev3 + UiLogoMark 52 с бейджем check success)
  + title 22/600 + body 15 textDim + UiButton primary lg «Got it»
```

### `UiInstallStep` / `UiStepVisual`

```
UiInstallStep: n, title, hint, visual, label?
  grid [24 | 1fr | 76], gap 12, padding 12, r16, bgElev1, border hairline
  номер: круг 24 accentSoft, 13/600 display accent
  title 16/600 · hint 13/500 textDim

UiStepVisual: kind, label?
  76×56, r10, bg bg, border hairline — только CSS + Lucide, без координат реального UI браузера
  share       круг 32 accentSoft (share) + круг 22 bgElev3 (ellipsis)
  menuAdd     3 полоски меню, средняя подсвечена accentSoft + square-plus
  menuInstall то же с download
  add         полоска + label 10/600 accent; ниже UiLogoMark 18 + полоска
  kebab       адресная строка 36×14 + круг 22 accentSoft (ellipsis-vertical)
  install     pill h24 accent, label 10/600 accentInk
```

### Motion

```
баннер: появление через 600ms, opacity + translateY −8→0, 240ms ease-out
  закрытие: карточка opacity→0 + scale 0.98 (150ms), через 120ms строка схлопывается grid-rows 1fr→0fr (240ms)
шаги: opacity + translateY 8→0, 240ms ease-out, stagger 40ms (повторяется при смене платформы)
успех: fade 240ms; иконка scale 0.6→1 420ms spring, бейдж с задержкой 240ms
prefers-reduced-motion — глобальное правило в main.css
```

---

## Семья (v2.0, фаза 8)

Прототип: `design_handoff_myday/MyDay Family export/MyDay Family.html`, код артбордов — `family-kit.jsx`, `family-owner.jsx`, `family-join.jsx`. Модель данных и правила вступления/выхода — `ARCHITECTURE.md` → «Семья»; ниже только UI. Спека дизайнера перенесена с правками под принятые решения — они помечены ⚠️.

i18n: все строки (en/ru) собраны в `family-i18n.jsx` (`FAM_I18N.family.*`, плюрализация `people` / `tx` / `sv`) — переносить в `i18n/locales/*.json` оттуда, с правками из «Тексты: отличия от макета». `family.people.*` — демо-имена макета, не переносить.

### Ключевые решения

- **Точка входа** — отдельная карточка «Семья» сразу под профилем в Settings, без заголовка секции. Семья — свойство аккаунта, а не настройка интерфейса.
- **Объяснение фичи — на самом экране «Семья», пока ты один**, без онбординг-слайдов.
- **Выбор копилки — первый шаг шторки приглашения**, только пока ты один. Повторные приглашения сразу создают ссылку.
- **Ссылка показывается один раз** (в БД только хеш) — шторка «Ссылка готова» прямо об этом говорит. Дальше на экране — строка «Приглашение отправлено» с «Создать новую» и «Отозвать».
- **Действия с участником — через «•••» на строке, а не свайп**: свайп по людям неожидан и срабатывает случайно. «•••» только у владельца и не у себя.
- **Автор операции — бейдж-инициал 18px на углу иконки категории**, только у чужих операций: строка не становится шире, свои выглядят как раньше.
- **«Только мои» — чип в FilterBar** (первым), только при 2+ участниках. Та же модель, что остальные фильтры v3: hero, разбивка и список пересчитываются, «Сбросить» сбрасывает и его.
- **Вступление — полноэкранный маршрут без таб-бара**, кнопки в липком футере. После — экран «Ты в семье» → Finance с тостом.
- **Данных реального времени нет**: подсказка внизу экрана «Семья» говорит, что изменения других видны при следующем открытии.

### Маршруты и состояния

```
/settings                 карточка FamilyRow
/settings/family          FamilySoloScreen (участник один) | FamilyScreen (2+)
/family/join/:token       fullscreen, без таб-бара
  гость   → токен в sessionStorage['myday:pendingInvite'] → /auth/welcome
            (WelcomeInviteCard; после входа/регистрации auth-middleware ведёт обратно на /family/join/:token)
  ok      ← превью state 'ready'
  busy    ← state 'mustLeave'
  already ← state 'alreadyMember'; own ? ownBody : memberBody
  invalid ← 404 (истекла / отозвана / использована — один текст: важно одно, попросить новую)
  success ← после POST /api/household/join
```

⚠️ Превью — `GET /api/household/join?token=` (не `/api/family/invites/:token/preview`), карточка гостя — `GET /api/auth/invite?token=`.

### Новые базовые компоненты

#### `UiAvatar`

```
props: name, colorIndex: 0–3, size = 40, dashed?: boolean, ring?: цвет фона под аватаром
круг, bg m{i}Soft, текст m{i}, display 600, fontSize round(size × 0.42), первая буква имени
dashed («+» на solo-экране): transparent + 1.5px dashed hairline2 + user-plus textMute
ring: box-shadow 0 0 0 3px {ring} (2px при size ≤ 30)
⚠️ автора нет среди участников (ушёл или исключён): bg bgElev3, иконка user textMute вместо буквы
```

#### `UiAvatarStack`

```
props: members[], size = 24, ring = фон контейнера
перекрытие −30% size, z-index по убыванию слева направо
```

### Settings и экран «Семья»

#### `FamilyRow`

```
отдельная UiCard, mt 8 под профилем
UiSettingRow: icon users, label «Семья», sub: «Только ты» | «Ты и {name}» | «{n} человек»
trailing (2+): UiAvatarStack 26 всех, кроме тебя (ring bgElev1) + chevron
```

#### `FamilySoloScreen` (ты один)

```
page padding 4 20 120
BackBtn: accent, chevron-left 24 + «Настройки» 16/500, h 44
hero: UiAvatar 64 (ring bg) + UiAvatar dashed 64, перекрытие −12; за ними radial accentSoft 280×200; mt 12
title2 28/700/-0.02em по центру, mt 20, text-wrap balance · body 15/21 textDim, max-w 330, mt 8
карточка «Общее с семьёй»: UiCard padding 16, mt 24; overline, затем grid 2 колонки, gap 14 12, mt 14
  пункт: IconDisc 36 (accentSoft / accent, иконка 18) + label 15/600 (+ sub 12/500 textMute)
  ⚠️ 3 пункта, без «Тегов»: receipt «Операции» · shapes «Категории» · piggy-bank «Копилка» (col-span 2, sub «общая или у каждого своя»)
карточка «Только твоё»: UiCard padding 14 16, mt 8
  IconDisc 36 neutral (bgElev3 / textDim) list-checks + overline + 15/600 ⚠️ «Задачи, шаблоны и теги»
  справа lock 14 + 12/500 textMute «Семья их не видит»
CTA: UiButton primary lg full, icon user-plus «Пригласить», mt 20
  есть активное приглашение → вместо кнопки UiCard с PendingInviteRow
footnote 13/18 textMute по центру, mt 12
```

#### `FamilyScreen` (2+)

```
BackBtn → h1 title1 34/700 «Семья» → sub 15 textDim «{n} человека · общие финансы»
UiSectionHeader «Участники» → UiCard:
  MemberRow: min-h 64, padding 12 8 12 16
    UiAvatar 40 · gap 12 · [имя 15/600 + бейджи; email 13 textDim, ellipsis] · «•••» 44×44
    «•••» — только у владельца и не на своей строке → MemberSheet
    бейджи h 20, radius full, 11/600: «Владелец» bgElev3/textDim · «Это ты» accentSoft/accent
  последняя строка (только владелец): «Пригласить ещё» (IconDisc plus 40 + 15/600 accent) или PendingInviteRow
UiSectionHeader «Копилка»:
  владелец: UiCard padding 12 → UiPillSelect [Общая | У каждого своя] + описание 13/18 textDim, padding 10 4 2
            переключение → SavingsModeSheet, значение меняется только после подтверждения
  участник: UiSettingRow piggy-bank, «Общая копилка» | «У каждого своя копилка», sub «Поменять может только владелец», trailing lock 16 textMute
подсказка 12/16 textMute, mt 16 («Изменения других участников появляются при следующем открытии экрана.»)
«Выйти из семьи»: h 52, r 12, dangerSoft bg, danger 16/600, icon log-out 18, mt 20 (как Sign out) → LeaveSheet
```

#### `PendingInviteRow`

```
UiSettingRow: IconDisc clock 40 (warningSoft / warning), «Приглашение отправлено», sub «Ссылка действует до {date}», chevron
→ InviteSheet step 'active'
```

### Шторки

Все — feature-компоненты внутри `UiSheet`. Общая шапка `SheetHead`: IconDisc 48 (иконка 22) · gap 14 · title3 22/600 + sub 15 textDim, padding 16 64 0 20. Смена шага внутри шторки — кроссфейд 240ms.

#### `InviteSheet`

```
props: step: 'savings' | 'ready' | 'active'
savings (только когда ты один): SheetHead piggy-bank «Какой будет копилка?»
  2 × RadioCard (gap 8, margin 20 20 0): «Общая копилка» (бейдж «По умолчанию») | «У каждого своя»
    RadioCard: padding 16, r 16; off bgElev1 + 1.5px hairline; on accentSoft + 1.5px accent
    радио 22: off 2px textMute; on accent + check 14 accentInk, spring 150ms
  primary lg full «Создать ссылку» (icon link; loading «Создаём…»), padding 24 20 34
  → PATCH /api/household { shareSavings }, если выбор отличается от текущего, затем POST /api/household/invite
ready: SheetHead check (successSoft / success, famPop) «Ссылка готова»
  поле ссылки: h 52, r 12, bg field, border hairline2, link 18 textMute + mono 14 ellipsis; тап = копировать
  мета: clock 14 + 13/500 textMute «Действует до {date} · одноразовая», mt 8
  grid 2, gap 8, mt 16: [primary lg «Поделиться», icon share → navigator.share]
                        [tonal lg (bg field) «Скопировать», icon copy → check success на 2 с]
    navigator.share нет → только «Скопировать» на всю ширину
  Note (accentSoft, info 18 accent, 13/500 text) «Ссылку видно только сейчас…», mt 16
  ghost danger full «Отозвать ссылку», padding 12 20 34
active: SheetHead clock (warningSoft / warning) «Ссылка-приглашение» / «Действует до {date}»
  Note «Саму ссылку мы не храним…» → tonal lg full «Создать новую» (icon refresh) → step ready
  + 13 textMute по центру «Текущая ссылка перестанет работать.» → ghost danger «Отозвать ссылку»
отзыв → DELETE /api/household/invite, закрыть шторку + info-тост «Ссылка отозвана»
```

#### `MemberSheet`

```
info: по центру UiAvatar 64, имя title3, email 14 textDim,
      мета 13 textMute «В семье с {date} · Добавлено: {tx}»
  ⚠️ tonal h 52 full «Сделать владельцем» (icon crown) → step transfer
  dangerSoft h 52 full «Исключить из семьи» (icon user-minus) → step remove, gap 8
⚠️ transfer: SheetHead [UiAvatar 48] «Сделать {name} владельцем?» → Consequences:
    1. crown · accent — «{name} сможет приглашать и исключать» / «И менять режим копилки.»
    2. user — «Ты станешь участником» / «Вернуть роль сможет только новый владелец.»
  primary lg full «Передать» + ghost «Отмена»
  → PATCH /api/household/members/:userId { role: 'OWNER' }, success-тост «Владелец теперь — {name}»
remove: SheetHead [UiAvatar 48] «Исключить из семьи?» / «{name} · {email}» → Consequences (remove.*)
  danger lg full «Исключить» + ghost «Отмена» → DELETE /api/household/members/:userId, тост «{name} больше не в семье»
```

#### `Consequences`

```
UiCard bgElev1, margin 20 20 0
строка: padding 14 16, IconDisc 32 (иконка 16) · gap 12 · title 15/600 + sub 13/18 textDim; разделитель hairline
появление stagger 40ms
```

#### `LeaveSheet`

```
SheetHead log-out (dangerSoft / danger) «Выйти из семьи?» → Consequences:
  1. copy · accent — «Заберёшь копию» / «Твои {tx} и {sv}» (счётчики своей строки из GET /api/household)
  2. users — «В семье всё останется» / «Включая твои записи…»
     ⚠️ раздельная копилка — sub leave.staysSubSeparate: записи копилки уезжают, а не копируются
  3. (только владелец) user-check · warning — «Владельцем станет {name}» / «Дольше всех в семье.»
     name — самый давний из остальных (members отсортированы по joinedAt)
  4. user — «Снова станешь „семьёй из одного“» / «Задачи никак не изменятся.»
danger lg full «Выйти из семьи» + ghost «Отмена»
→ POST /api/household/leave → /settings + success-тост «Ты больше не в семье»
```

#### `SavingsModeSheet` (только владелец)

```
SheetHead piggy-bank + title/body по направлению (savingsMode.toSeparate* | toShared*)
→ «у каждого своя»: UiCard со строками [UiAvatar 32 · имя 15/600 · сумма display 16/600] — кому сколько останется видно
primary lg «Поменять» + ghost «Отмена» → PATCH /api/household { shareSavings }, success-тост «Копилка теперь {mode}»
```

⚠️ Записи не переезжают — меняется только видимость: при раздельной копилке каждый видит свои записи, при общей — все. Суммы «кому сколько» — `members[].savingsBalance`, отдаётся только при общей копилке (иначе владелец видел бы чужие копилки).

### Вступление по ссылке

#### `WelcomeInviteCard` (Welcome, гость с pendingInvite)

```
top 300, left/right 20, padding 12 14 12 12, r 16, bg bgElev1, border 1px accentSoft + ring 4px accentSoft
UiAvatar 40 пригласившего (inviterColorIndex) · gap 12 · 15/600 «{name} зовёт тебя в семью» + 13/500 textDim «Войди или создай аккаунт, чтобы принять»
шторка Welcome: title «Войди, чтобы вступить», sub «Сразу после входа вернём тебя к приглашению.» Кнопки без изменений
токен невалиден (404) → карточку не показываем, pendingInvite стираем
```

#### `JoinScreen` (state ok)

```
page padding 20 20 180
hero: UiAvatarStack 56 (семья) · plus 18 textMute · UiAvatar 56 твой с двойным кольцом (2px bg + 1.5px hairline2); famPop 420ms
overline accent «Приглашение», mt 20 → title 26/32/700 balance «{inviterName} зовёт тебя в семью»
→ 14 textDim «В семье {people}» → чипы участников (h 28, radius full, bgElev1, UiAvatar 20 + имя 13/600 + «· владелец» textMute)
overline «Что будет с твоими данными», mt 24 → Consequences (все цифры — из mine превью):
  1. merge · accent — «Твои {tx} и копилка переедут в семью»       (скрыть, если transactionCount 0 и savingsBalance 0)
  2. shapes · accent — ⚠️ «Одинаковые категории склеятся» / «Совпадают: {list}. Остальные добавятся.»
       list — matchingCategories через categoryLabel(); пусто → sub join.mergeNone
  3. piggy-bank · accent — shareSavings ? «Копилка общая» / «Твои {amount} добавятся в неё»
                                        : «Копилка у каждого своя» / «Твои {amount} останутся твоими»   (скрыть при savingsBalance 0)
  4. lock · neutral — «Задачи останутся личными» / «Семья их не видит.»
footnote 13 textMute по центру
StickyFooter: padding 24 20 34, bg linear-gradient(transparent → bg 28%)
  primary lg «Вступить» (loading «Объединяем…», disabled) + ghost «Не сейчас» → /today
  409 при вступлении (состав поменялся) → error-тост, превью перезапросить
```

#### `JoinSuccess`

```
по центру; radial accentSoft 360
hero: стопка семьи + твой аватар «въезжает» (famSlide translateX 40→0, 420ms spring), зазор схлопывается 14→−17,
  бейдж check success 22 (border 2px bg) famPop с задержкой 240ms
title2 28/700 «Ты в семье», mt 28 · body 15 textDim max-w 300
StickyFooter: primary lg «Открыть финансы» (icon wallet) → /finance + success-тост «Общий бюджет включён»
```

#### `JoinStatus` (busy / invalid / already)

```
по центру, padding 0 28 140: IconDisc 72 (иконка 30) famPop → title 26/32/700 mt 24 → body 15/21 textDim max-w 310 → StickyFooter
busy:    users · warning; UiCard «Твоя семья сейчас» (стопка + имена из GET /api/household), mt 24;
         primary «Перейти к семье» → /settings/family + ghost «Не сейчас»
invalid: link-off · neutral; primary «Открыть MyDay» → /today
already: user-check · success; ownBody | memberBody; primary «Открыть «Семью»» → /settings/family
```

### Изменения в существующих компонентах (только при 2+ участниках)

```
UiTxRow: иконка категории 40 в relative-обёртке; чужая операция (tx.userId ≠ мой) —
  UiAvatar 18 (10/700) right −4 bottom −4, ring 2px bgElev1. Свои — без бейджа. Ширина и текст строки не меняются
  у двух других участников совпала первая буква → в мета-строке после категории имя: «Еда · Маша»
TransactionEditSheet (edit): под суммой 13 textMute «Автор: {name} · {date}» (date — createdAt; без глагола — у имени нет рода)
  ⚠️ автора нет среди участников → «Автор: бывший участник». Создание — без изменений
FilterBar: первый чип «Только мои» — UiAvatar 20 свой + label; active accentSoft + accent border + × 14; входит в «Сбросить»
  mine → ключ кэша и query transactions и summary (?mine=true)
Finance шапка: справа от h1 UiAvatarStack 28 всех участников (ring bg), тап → /settings/family
UiSavingsCard (общая копилка): справа от overline UiAvatarStack 20 + 12/600 textDim «Общая»;
  в истории бейдж автора на круге ↑/↓, как в UiTxRow. Раздельная — без изменений
Исключённый (removedNotice): info-тост без автоскрытия, закрывается тапом —
  «Тебя исключили из семьи. Копия твоих записей уже здесь.» → DELETE /api/household/notice
```

### Тексты: отличия от макета

```
family.solo.tasks          ⚠️ «Задачи, шаблоны и теги» / "Tasks, templates and tags"; ключ solo.tags не переносить
family.join.merge          ⚠️ «Одинаковые категории склеятся» / "Matching categories merge"
family.join.mergeNone      + «Твои категории добавятся к семейным.» / "Your categories are added to the family's."
family.leave.staysSubSeparate  + «Операции останутся в семье, твоя копилка уйдёт с тобой.» / "Transactions stay with the family; your savings leave with you."
family.remove.staysSubSeparate + «Операции останутся в семье, его копилка уйдёт с ним.» / "Transactions stay with the family; their savings leave with them."
family.member.makeOwner    + «Сделать владельцем» / "Make owner"
family.transfer.*          + title «Сделать {name} владельцем?» · rights «{name} сможет приглашать и исключать» · rightsSub «И менять режим копилки.»
                             · you «Ты станешь участником» · youSub «Вернуть роль сможет только новый владелец.»
                             · cta «Передать» · cancel «Отмена» · done «Владелец теперь — {name}»
                             (en: "Make {name} the owner?" · "{name} can invite and remove people" · "And change how savings work."
                              · "You become a member" · "Only the new owner can give the role back." · "Transfer" · "Cancel" · "{name} is now the owner")
family.formerMember        + «бывший участник» / "former member"
family.settings.many       ru «{n}» → через плюрализацию people
```

### Доработки API под UI (в 8.7)

- `GET /api/household`: `members[].savingsBalance` — только при `shareSavings`, иначе `null`. Нужен `SavingsModeSheet`.
- `GET /api/household/join`: `own: boolean` — приглашение создал ты (`already` различает ownBody / memberBody; по роли не угадать — владение передаётся).

### Токены, отступы, типографика

```
новые цвета: m0…m3 + m{i}Soft, successSoft, warningSoft, dangerSoft — см. «Цветовые токены»
поверхность поля ссылки и tonal-кнопки «Скопировать» — существующий field
отступы: page 20, карточки 16, шторка 20, sticky-футер 24 20 34
радиусы: карточки и RadioCard 16, поле ссылки и Note 12, dangerSoft-кнопка 12, шторка 24
типографика: title1 34 (Семья), title2 28 / 26 (hero), title3 22 (шторки), 15/600 строки, 13 подписи, 11/600 overline
зоны нажатия ≥ 44: «•••», BackBtn, крестик шторки
```

### Motion

```
переходы экранов: fade 240ms ease-out
solo hero: famPop (scale 0.6→1 + fade) 420ms spring; карточки «Общее» / «Только твоё»: stepIn (translateY 8→0 + fade) 240ms, delay 60 / 100ms
шторка: как UiSheet; смена шага — кроссфейд 240ms
«Ссылка готова»: check famPop 420ms spring · «Скопировать» → check success на 2 с
Consequences: stagger 40ms · строки участников: stepIn 240ms
Join success: см. JoinSuccess; Finance после вступления — fade 360ms + тост translateY 20→0 240ms spring, 3 с
чип «Только мои»: цвет 150ms; hero-сумма и список — fade 240ms при пересчёте
prefers-reduced-motion — глобальное правило в main.css
```
