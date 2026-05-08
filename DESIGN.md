# DESIGN.md — MyDay Design System

## Обзор

**MyDay** — мобильное приложение (390×844, iPhone-sized). Дизайн iOS-inspired, dark-first с поддержкой светлой темы. Единый акцентный цвет (violet по умолчанию, user-swappable).

Прототип: `design_handoff_myday/prototype/MyDay.html`
Авторизация: `design_handoff_myday/prototype/MyDay Auth.html`

---

## Цветовые токены

CSS-переменные переключаются через класс `.dark` / `.light` на `<html>`. Tailwind: `darkMode: 'class'`.

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
| 4 | Today | `/today` | default |
| 5 | All Tasks | `/tasks` | default |
| 6 | Task Templates | `/tasks/templates` | default |
| 7 | Finance | `/finance` | default |
| 8 | Settings | `/settings` | default |
| 9 | Task Sheet | modal (любая вкладка) | — |
| 10 | Add Transaction Sheet | modal (Finance) | — |

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
  completed: boolean
  onComplete: () => void
  onDelete:   () => void

right swipe → green check (threshold 90px) → onComplete
left  swipe → red trash   (threshold 90px) → onDelete
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

