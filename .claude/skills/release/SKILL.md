---
name: release
description: Выпуск релиза MyDay — собрать коммиты с последнего тега, написать пользовательские patch notes на en и ru в shared/changelog.ts, поднять версию, закоммитить в dev и открыть PR dev → main. Используй, когда Максим пишет /release, «сделай релиз», «собери патч ноут», «выкатываем в main».
---

# Релиз MyDay

Патч-ноуты пишет Claude, мержит Максим. Тег и GitHub Release после мержа ставит `.github/workflows/release.yml` сам. Чек `changelog` в CI не даст смержить PR в `main`, если с последнего тега есть `feat`/`fix`/`perf`, а записи для новой версии нет. Поэтому любой PR в `main`, даже хотфикс, проходит через этот скилл.

## 1. Подготовка

```bash
git status --short          # должно быть пусто — иначе стоп, спроси
git checkout dev && git pull --ff-only
git fetch origin --tags
gh auth status              # не залогинен — попроси выполнить `gh auth login`
pnpm release:status
```

`release:status` печатает последний тег (старший по semver, а не ближайший по истории — тег стоит на merge-коммите в `main`, из `dev` он недостижим), текущую версию, предлагаемую следующую и все релизные коммиты с телами.

- `Next version: nothing to release` → релизить нечего, скажи об этом и остановись.
- Версию берём из вывода: breaking (`!` или `BREAKING CHANGE:`) → major, есть `feat` → minor, только `fix`/`perf` → patch. Хочешь отступить — спроси.

## 2. Понять, что поменялось для пользователя

Заголовка коммита часто мало. Читай тело коммита (оно в выводе), при необходимости `git show --stat <hash>` и запись шага в `ARCHITECTURE.md` → «Журнал реализации», если работа закрывала пункт `ROADMAP.md`. Пиши про то, что пользователь заметит, а не про то, как это сделано.

## 3. Написать запись

Новая запись — **первой** в массиве `shared/changelog.ts`:

```ts
{
  version: '1.1.0',
  date: '2026-10-08',                              // сегодня, YYYY-MM-DD
  title: { en: 'Savings', ru: 'Накопления' },      // необязательно, если у релиза есть тема
  changes: [
    { type: 'new', text: { en: '…', ru: '…' } },
    { type: 'improved', text: { en: '…', ru: '…' } },
    { type: 'fixed', text: { en: '…', ru: '…' } }
  ]
}
```

Правила текста:

- `type`: `feat` новой возможности → `new`; `feat`, который расширяет существующее, и `perf` → `improved`; `fix` → `fixed`. Порядок в массиве: new → improved → fixed.
- Одна строка — одно изменение, которое видно пользователю. Несколько коммитов про одно — склеить. Фикс того, что появилось в этом же релизе, — не упоминать.
- Чисто внутренние вещи (`jti` в токенах, рефактор, тесты) — не писать или обобщить до «Исправления безопасности входа», если пользователь мог это почувствовать.
- Без технических слов: не «breakdown follows the type filter», а «Диаграмма по категориям учитывает выбранный тип».
- Русский — на «ты», как в `i18n/locales/ru.json`; английский — простой, без маркетинга. Без точки в конце строки.
- Обе версии текста должны говорить одно и то же.

Затем поднять `"version"` в `package.json` до новой версии.

## 4. Проверить

```bash
pnpm release:check
pnpm vitest run tests/unit/schemas/changelog.test.ts tests/unit/release
pnpm lint
```

## 5. Показать Максиму и ждать «ок»

Покажи запись (en и ru) и коммит:

```
chore(release): v1.1.0
```

Без `Co-Authored-By` и подписей Claude. Ничего не коммить и не пушь до «ок». Правки текста — внести и показать снова.

## 6. Коммит, пуш, PR

```bash
git add shared/changelog.ts package.json
git commit -m "chore(release): v1.1.0"
git push origin dev
pnpm -s release:notes 1.1.0 > /tmp/release-notes.md
gh pr list --base main --head dev --state open   # уже открыт → gh pr edit <n> --title … --body-file …
gh pr create --base main --head dev --title "release: v1.1.0" --body-file /tmp/release-notes.md
```

Дай Максиму ссылку на PR. Мержит он сам, когда все четыре чека зелёные (`lint · typecheck · unit · build`, `integration api`, `e2e`, `changelog`). Напрямую в `main` не пушить — защита ветки это и так запрещает.

После мержа `release.yml` ставит тег `v1.1.0` и создаёт GitHub Release с тем же текстом. Деплой на сервер по-прежнему ручной: `docker compose up -d --build`.
