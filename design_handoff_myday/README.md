# Handoff: MyDay — Personal Productivity App

## Overview

**MyDay** is a mobile-first personal productivity app combining task management and personal finance tracking. The design is iOS-inspired but original — sitting somewhere between Linear and Apple Reminders aesthetically. It's dark-first, with a single accent color, generous spacing, and spring-animated interactions.

**Target:** Mobile (390 × 844, iPhone-sized). Web prototype is the design reference; the production build is expected to be a native app (SwiftUI / React Native / Flutter) or a mobile web app.

---

## About the Design Files

The files in `prototype/` are **design references created in HTML/JSX** — they show the intended look, layout, and behavior, but they are NOT production code to copy directly.

The task is to **recreate these designs in the target codebase's environment**:
- If the project is **SwiftUI**, build native iOS components matching the visual spec.
- If the project is **React Native** or **Flutter**, use the platform's idioms.
- If there is **no existing codebase**, choose the most appropriate framework (SwiftUI is most aligned with the design language; React Native if cross-platform is required) and implement there.

The HTML prototype uses React + Babel inline for prototyping speed only — do NOT ship the HTML.

---

## Fidelity

**High-fidelity (hifi).** All colors, typography, spacing, radii, shadows, animation timings, and interaction details in this handoff are final and should be implemented exactly as specified. Token values are listed below and also live in `prototype/tokens.js`.

---

## Files in This Bundle

```
design_handoff_myday/
├── README.md                          ← you are here
├── tailwind.config.js                 ← ready-to-paste Tailwind config
└── prototype/
    ├── MyDay.html                     ← the interactive prototype (open this first)
    ├── DesignSystem.html              ← visual reference for tokens & components
    ├── tokens.js                      ← all design tokens, single source of truth
    ├── app.jsx                        ← root state + screen routing
    ├── components.jsx                 ← Card, Button, Input, Pill, Badge, etc.
    ├── icons.jsx                      ← SF-Symbols-style filled icons
    ├── ios-frame.jsx                  ← phone bezel (prototype only, do not ship)
    ├── tabbar.jsx                     ← bottom tab bar + FAB + SwipeRow
    ├── screens-today.jsx              ← Today screen
    ├── screens-tasks.jsx              ← All Tasks screen
    ├── screens-other.jsx              ← Finance, Settings, Sheets
    └── tweaks-panel.jsx               ← prototype-only accent swap (do not ship)
```

**Open `MyDay.html` in a browser to see the working prototype.** Open `DesignSystem.html` for the standalone token & component reference.

---

## Design Tokens

### Colors

```
// Surfaces (deep slate, NEVER pure black)
--c-bg:        #0F0F14   page background
--c-bgElev1:   #15151C   cards
--c-bgElev2:   #1C1C25   sheets / modals / inputs
--c-bgElev3:   #26262F   pressed states
--c-hairline:  rgba(255,255,255,0.06)   thin dividers
--c-hairline2: rgba(255,255,255,0.10)   stronger dividers

// Text
--c-text:      #F4F4F7   primary
--c-textDim:   #A1A1AA   secondary
--c-textMute:  #6B6B75   tertiary / metadata
--c-textGhost: #3F3F47   disabled / placeholder

// Accent (default = violet; user-swappable in prototype)
--c-accent:    #A78BFA   primary CTAs, active states, key data viz
--c-accentSoft:rgba(167,139,250,0.14)   accent-tinted surfaces
--c-accentInk: #0F0F14   text/icons on accent

// Semantic
--c-success:   #34D399   complete state, income
--c-warning:   #FBBF24   medium priority
--c-danger:    #F87171   delete, overspend
--c-info:      #60A5FA   informational

// Priority pills
--c-pHigh:     #F87171
--c-pMed:      #FBBF24
--c-pLow:      #60A5FA
--c-pNone:     #6B6B75
```

**Alternate accents (curated, for theme picker):**
- Violet (default) `#A78BFA`
- Teal `#2DD4BF`
- Amber `#F59E0B`
- Sky `#38BDF8`
- Rose `#FB7185`

### Typography

- **Display font:** SF Pro Display (fallback: `-apple-system, system-ui, sans-serif`) — used for all headings, hero numbers, task titles
- **Body font:** Inter (fallback: `-apple-system, system-ui, sans-serif`) — used for body, buttons, metadata
- **Mono:** SF Mono / `ui-monospace` — for numeric tabular data only

**Type scale** (size / line-height / weight / letter-spacing):

| Token     | Size | LH   | Weight | Tracking | Use                          |
|-----------|------|------|--------|----------|------------------------------|
| hero      | 56   | 60   | 700    | -0.03em  | Balance hero number          |
| title1    | 34   | 40   | 700    | -0.02em  | Page titles ("Today")        |
| title2    | 28   | 34   | 700    | -0.02em  | Hero task title              |
| title3    | 22   | 28   | 600    | -0.01em  | Section headers              |
| headline  | 17   | 22   | 600    | -0.01em  | Task names, list items       |
| body      | 17   | 24   | 400    | -0.01em  | Body text                    |
| callout   | 16   | 21   | 500    | -0.005em | Buttons                      |
| sub       | 15   | 20   | 400    | 0        | Sub copy                     |
| footnote  | 13   | 18   | 500    | 0        | Meta, time tags              |
| caption   | 12   | 16   | 500    | 0.01em   | Tiny labels                  |
| overline  | 11   | 14   | 600    | 0.08em   | UPPERCASE section labels     |

### Spacing (4px base, 16px primary unit)

`2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64` px. **Default page padding: 20px horizontal.** **Default card inner padding: 16px.** **Min hit target: 44px.**

### Radius

| Token | Px  | Use                                   |
|-------|-----|---------------------------------------|
| sm    | 8   | buttons                               |
| md    | 12  | inputs                                |
| lg    | 16  | cards                                 |
| xl    | 20  | hero card                             |
| 2xl   | 24  | bottom sheet (top corners)            |
| full  | 9999| pills, FAB, avatars, swipe-action btn |

### Shadows / Elevation

Subtle layered shadows; depth is built via background elevation, not heavy drops.

```
sm:    0 1px 2px rgba(0,0,0,0.4)
md:    0 4px 14px rgba(0,0,0,0.35)
lg:    0 12px 36px rgba(0,0,0,0.45)
sheet: 0 -8px 32px rgba(0,0,0,0.4)        ← bottom sheet
glow:  0 8px 24px {accent}33, 0 2px 8px {accent}22   ← FAB
```

### Motion

```
ease.out:    cubic-bezier(0.22, 1, 0.36, 1)        ← standard exits
ease.inOut:  cubic-bezier(0.65, 0, 0.35, 1)        ← state changes
ease.spring: cubic-bezier(0.34, 1.56, 0.64, 1)     ← overshoot, used for press/scale

dur.fast:  150ms   button press, icon scale
dur.base:  240ms   most transitions
dur.slow:  360ms   tab content fade
dur.sheet: 420ms   bottom sheet open/close
```

---

## Screens

### 1. Today

**Purpose:** Daily landing page. Greeting, progress at a glance, and what to focus on right now.

**Layout (top → bottom):**
1. **Status bar** + safe area (44px top inset on iOS)
2. **Header** (px 20, pt 16): overline date "THURSDAY, MAY 7" (`overline`, textMute) + title1 greeting "Good afternoon" / "Доброе утро/день/вечер"
3. **Stats row** (mt 16): 2-column grid, gap 12. Left card = day-streak with flame icon; right card = "X / 7 completed today" with horizontal accent progress bar
4. **Hero "Focus" card** (mt 16): bgElev1, radius xl, padding 20. Inside: accentSoft pill labeled "TODAY · FOCUS" (with flag icon), title2 task title, footnote row (calendar icon + time + tag pills), large 28px circular toggle on the right
5. **Sectioned task list** below, grouped by **Morning / Afternoon / Evening**. Each section header = overline + count of open tasks. List rows are SwipeRow-wrapped TaskRows (see Components).
6. **FAB** anchored bottom-right (right 20, bottom 100), 56×56, accent fill, plus icon
7. **Tab bar** at bottom (84px tall + 34px safe area)

**Spec details:**
- Card hierarchy: Hero card sits on bgElev1; surrounding rows on bg. Hero gets a `glow` shadow tinted with accent.
- Section dividers are NOT lines — they're the overline labels themselves.
- Empty state per section: hide the section entirely if no tasks.

### 2. All Tasks

**Purpose:** Full searchable task list with filters.

**Layout:**
1. Header: title1 "Tasks" / "Задачи"
2. Search input (md radius, bgElev2, 44px tall, magnifying-glass leading icon)
3. Segmented control (radius full, bgElev1 track, accent thumb): All / Open / Done
4. Flat list of SwipeRow → TaskRow

**Empty states:**
- "No tasks yet — tap + to add your first one"
- "Nothing matches that filter"

### 3. Finance Dashboard

**Purpose:** Month-at-a-glance financial state.

**Layout:**
1. Header: title1 "Finance" / "Финансы"
2. **Hero card** (bgElev1, radius xl, padding 24): overline "MAY · NET", hero number (e.g. "+ $1,847.50") — colored success if positive, danger if negative
3. **Income vs Expense bar** (mt 16): single horizontal bar, height 12, radius full. Two segments — green (income) | red (expense), proportional. Below: two rows with colored dots, label, and amount.
4. **Category breakdown** (mt 24): list of categories. Each row = icon (in tinted circle) + label + amount + horizontal progress bar showing % of total spend.
5. **Recent transactions** (mt 24): overline "RECENT", list of TxRow (icon + name + date) and amount (colored by income/expense).
6. **FAB** + **Tab bar** (FAB triggers Add Transaction sheet on this tab)

### 4. Settings

**Purpose:** Profile + preferences.

**Layout:**
1. Header: title1 "Settings" / "Настройки"
2. **Profile card** (avatar 56px, name title3, email footnote-textDim)
3. **Grouped lists** (iOS-style cards with inset rows separated by hairlines):
   - **Notifications** — switch (Daily reminder)
   - **Language** — segmented control EN / RU
   - **Appearance** — segmented control Dark / Light / System (Light not yet implemented; show but disabled)
   - **Account** — Sign out (danger color), Delete account (danger color, smaller)

### 5. Task Sheet (modal)

**Purpose:** Create or edit a task. Opens from FAB on Today/Tasks, or by tapping a task row.

**Layout** (bottom sheet, radius 24 top, max-height 90vh, slides up with `dur.sheet` + `ease.spring`):
1. Drag handle (40×4, hairline2, radius full, centered, mt 8)
2. Header row: cancel button (text only, textDim) | title3 "New task" / "Edit task" | save button (callout, accent)
3. **Title input** (large, font display, no background — feels like writing)
4. **Notes textarea** (body, multi-line, bgElev2, radius md, 4 rows min)
5. **Deadline strip:** horizontally scrolling 7-day chips. Each chip = day-name top + date number bottom. Selected chip = accent fill + accentInk text.
6. **Priority pills:** None / Low / Med / High. Pills (radius full, padding 8/14). Selected pill = colored fill matching priority semantic color.
7. **Repeat:** row with chevron, opens secondary sheet (Daily / Weekly / Monthly / Custom)
8. **Tags:** chips row + "+" to add new

**Backdrop:** `rgba(0,0,0,0.6)` with backdrop-blur 8px, fades in 240ms.

### 6. Add Transaction Sheet (modal)

Same chrome as Task Sheet.

**Layout:**
1. Drag handle, header (cancel | "New transaction" | save)
2. **Type toggle**: Expense / Income segmented control (full radius, accent thumb). Below, large hero amount input (font display 56px, centered, signed: `−$ 0.00` for expense, `+$ 0.00` for income, color matches).
3. **Category grid:** 4 columns × N rows. Each cell = 64×64 rounded-square icon tile + 12px label below. Selected cell = accent border 2px + accentSoft fill.
4. **Note input** (single line, bgElev2, radius md)
5. **Date** row with chevron (defaults to "Today")

### Bottom Tab Bar (global)

**Layout:** 4 evenly-distributed items, height 84px + 34 safe-bottom. Background `rgba(15,15,20,0.85)` with backdrop-blur 24px, top hairline border.

**Item structure:** 26px filled icon (top) + 11px caption (bottom), gap 4.

**Active state:**
- Icon color = accent
- Icon background = accentSoft circle (40×40, radius full) — appears with `dur.base ease.spring`, scaling in
- Label color = accent
- Inactive: icon + label = textMute

**Tabs:** Today (sun.max.fill) · Tasks (checkmark.circle.fill) · Finance (wallet.pass.fill) · Settings (gearshape.fill)

---

## Components

### Button

| Variant   | Background     | Text          | Border        | Radius | Padding   |
|-----------|----------------|---------------|---------------|--------|-----------|
| primary   | accent         | accentInk     | none          | sm (8) | 12 / 20   |
| secondary | bgElev2        | text          | hairline2     | sm     | 12 / 20   |
| ghost     | transparent    | accent        | none          | sm     | 12 / 16   |
| danger    | transparent    | danger        | none          | sm     | 12 / 16   |

All buttons: callout text (16/21/500), spring scale 0.96 on press, dur.fast.

### Input

- Background bgElev2, radius md (12), height 48, padding 0 16, border 1px transparent.
- Focus: border-color accent, no outline.
- Placeholder color textGhost.
- Leading/trailing icon support (icon size 20, color textDim).

### Card

- Default: bgElev1, radius lg (16), padding 16, no border.
- Hero variant: radius xl (20), padding 20–24.
- Pressable card adds spring scale 0.98 on press.

### Pill / Badge

- Pill: radius full, padding 4 / 10, caption (12/16/500). Used for tags, time-of-day labels, status.
- Badge: radius full, padding 2 / 8, overline (11/14/600 +0.08em uppercase). Used for inline category tags.
- Default: bgElev3 surface, textDim text. Tinted variants: `accentSoft + accent text`, `success` semi-transparent + success text, etc.

### TaskRow

Layout: `[ checkbox (28×28) ] [ title + meta ] [ priority bar (3×24, far right) ]`
- Checkbox: circle, hairline2 border 1.5px. Checked = accent fill + accentInk checkmark, with spring scale-up 0.6→1.05→1 on toggle (300ms).
- Title: headline. Strikethrough + textMute when done, 200ms ease.
- Meta line: footnote textMute. Format: `[time] · [tag1] · [tag2]`.
- Priority bar: 3px wide vertical bar pinned right edge, height 24, color = priority. None = transparent.
- Row padding: 14 / 16, gap 12, full-bleed background bg (sits on page).

### SwipeRow

Wraps any row; reveals action affordance underneath as user drags horizontally.

- **Right swipe** (drag right): reveals **green check** action behind the row from the left. At threshold (90px), commits = `onComplete` + success haptic.
- **Left swipe** (drag left): reveals **red trash** action behind the row from the right. At threshold (90px), commits = `onDelete` + warning haptic.
- Below threshold: row springs back (`ease.spring`, dur.base).
- Drag uses `pointerdown` + `pointermove` listeners. Translate the row, not the actions.

### FAB

- 56×56, radius full, accent fill, accentInk icon (plus, 26px).
- Position: absolute, right 20, bottom 100 (sits above tab bar).
- Shadow: `glow` tinted with accent. On press: scale 0.9, spring.

### Bottom Sheet

- Container: bgElev2, radius 2xl top corners only, shadow `sheet`.
- Slides up via `transform: translateY(0|100%)`, dur.sheet, ease.spring.
- Backdrop: full-screen `rgba(0,0,0,0.6)` + `backdrop-filter: blur(8px)`, fades 240ms ease.out.
- Drag handle at top: 40×4, hairline2, radius full, mt 8.
- Drag-to-dismiss: pointer drag on handle / top 80px area; commit at 120px translate.

---

## Interactions & Behavior

### Gestures

| Gesture                      | Effect                                              | Threshold | Animation               |
|------------------------------|-----------------------------------------------------|-----------|-------------------------|
| Tap task row (not checkbox)  | Open Task sheet in edit mode                        | —         | sheet slide up          |
| Tap checkbox                 | Toggle done. Haptic: light. Strikethrough text.     | —         | spring scale on circle  |
| Swipe row right →            | Complete (commits at 90px). Haptic: success.        | 90px      | row slides off, list reflows w/ ease.out |
| Swipe row left ←             | Delete (commits at 90px). Haptic: warning.          | 90px      | row slides off, danger flash |
| Tap FAB                      | Open create sheet (Task or Tx by current tab). Haptic: light. | — | sheet slide up |
| Drag sheet handle down       | Dismiss sheet                                       | 120px     | spring slide down       |
| Tap tab                      | Switch tab. Haptic: selection.                      | —         | content fade 360ms; active icon spring-scales in |
| Tap any pressable            | scale(0.96), spring                                 | —         | dur.fast                |

### Haptic Spec

- **Selection** (`light`) — tab change, segmented control, pill select
- **Light impact** — checkbox toggle, button press
- **Success** (success haptic) — task completed, transaction saved
- **Warning** — task/tx deleted
- **Error** — destructive confirm

iOS implementation: `UIImpactFeedbackGenerator(style:)`, `UISelectionFeedbackGenerator()`, `UINotificationFeedbackGenerator()`. Web fallback in prototype: `navigator.vibrate([10])`.

### Animation Timings (canonical)

- Press scale: 150ms spring, scale 0.96 (1.0 for FAB → 0.9)
- Tab content cross-fade: 360ms ease.out
- Sheet open/close: 420ms ease.spring (translateY + backdrop fade)
- Task strikethrough: 200ms ease.inOut on text-decoration + opacity
- Swipe-row settle/commit: 280ms ease.spring
- Active tab indicator scale-in: 240ms ease.spring (scale 0 → 1)

---

## State Management

Per-screen state needed:

```
// Root
tab: 'today' | 'tasks' | 'finance' | 'settings'
lang: 'en' | 'ru'
accent: hex string

// Tasks
tasks: Task[]
  Task = { id, title, notes, time, tag[], priority, done, repeat, sectionOfDay }
taskSheet: { open, task | null }

// Finance
transactions: Transaction[]
  Transaction = { id, amount, type: 'income'|'expense', category, note, date }
txSheet: bool
```

Mutations: `toggleTask(id)`, `deleteTask(id)`, `saveTask(taskOrNew)`, `saveTx(txOrNew)`. All should produce optimistic UI updates with the animations above.

Persistence: `localStorage` for the prototype; in production, use the platform's local store (CoreData / Room / SQLite) with sync layer TBD.

---

## Localization

Two languages shipped: **English** and **Russian**. All UI strings live in a `STR` map with `en` / `ru` keys. Date formatting uses the locale's day/month names. No mixed-language strings.

---

## Tailwind Config

A ready-to-paste `tailwind.config.js` is included at the root of this handoff. It encodes every token above. Drop it into a Tailwind v3+ project and the design tokens become available as utility classes (`bg-bg`, `text-text`, `rounded-lg`, `shadow-md`, `font-display`, `text-title1`, etc.).

---

## Open Questions for the Implementer

1. **Sync / backend** — is there a target API for tasks/tx, or local-only v1?
2. **Auth** — sign-in flow not yet designed.
3. **Light theme** — tokens above are dark-only. Light mode needs a parallel palette pass before shipping that toggle.
4. **iPad / web responsive** — design is mobile-only; if iPad/web are in scope, layouts need a separate adaptation.
5. **Accent persistence** — should accent color sync across devices, or stay a per-device preference?

---

## Assets

No external images. All icons are inline SVG, hand-drawn in SF-Symbols-style filled aesthetic — see `prototype/icons.jsx` for the source list. In a native build, prefer **SF Symbols** (iOS) or **Material Symbols** filled (Android) for matching glyphs; the prototype names map closely:

- `sun.max.fill`, `checkmark.circle.fill`, `wallet.pass.fill`, `gearshape.fill` (tabs)
- `flame.fill`, `flag.fill`, `calendar`, `tag.fill`, `magnifyingglass`, `plus`, `chevron.right`, `trash.fill`, `bell.fill`, `arrow.up.right`, `arrow.down.left`
