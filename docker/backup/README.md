# Бэкап базы

Сервис `backup` из `docker-compose.yml` по расписанию снимает `pg_dump` и кладёт его в зашифрованный restic-репозиторий на Google Drive, rclone служит транспортом. Почему устроено именно так — `ARCHITECTURE.md` → «Бэкап базы».

Все команды выполняются на сервере из папки с `docker-compose.yml`.

## Первая настройка

**1. Переменные в `.env`:**

- `BACKUP_PASSWORD` — пароль restic-репозитория, например `openssl rand -base64 32`. **Сохрани копию вне сервера**: без него бэкап не расшифровать.
- `BACKUP_PING_URL` — ping URL проверки на [healthchecks.io](https://healthchecks.io). Необязателен, но без него о сломавшемся бэкапе узнаешь только в момент восстановления.
- `BACKUP_SCHEDULE` — cron-выражение в **UTC**, по умолчанию `0 1 * * *` (04:00 МСК).

**2. Подключить Google Drive:**

```bash
docker compose run --rm backup rclone config
```

Ответы по порядку: `n` (new remote) → имя `gdrive` → тип `drive` → `client_id` и `client_secret` пустые → scope `drive.file` → `service_account_file` пустой → advanced config `n` → **auto config `n`**.

rclone напечатает команду `rclone authorize "drive" "…"`. Выполни её на маке (без brew, бинарником):

```bash
curl -O https://downloads.rclone.org/rclone-current-osx-arm64.zip && unzip rclone-current-osx-arm64.zip
```

```bash
./rclone-*-osx-arm64/rclone authorize "drive" "…"
```

Откроется браузер, войди в Google. Токен из терминала мака вставь на сервере в `config_token>`. Дальше: Shared Drive `n`, сохранить `y`, выход `q`. Конфиг с токеном живёт в volume `backup-state`.

**3. Создать репозиторий:**

```bash
docker compose run --rm backup restic init
```

**4. Первый бэкап и проверка, что он восстанавливается:**

```bash
docker compose run --rm backup backup
```

```bash
docker compose run --rm backup restore check
```

**5. Включить расписание:**

```bash
docker compose up -d
```

На healthchecks.io заведи проверку типа Cron с тем же выражением, что в `BACKUP_SCHEDULE`, таймзона UTC, grace 1 час. Сервис пингует `/start` перед прогоном, сам URL после успеха и `/fail` при ошибке.

## Повседневное

| Что | Команда |
|---|---|
| Список снимков | `docker compose run --rm backup restic snapshots` |
| Бэкап вне расписания | `docker compose run --rm backup backup` |
| Проверить снимок, не трогая прод | `docker compose run --rm backup restore check [snapshot]` |
| Логи ночных прогонов | `docker compose logs backup` |

`restore check` разворачивает снимок во временную базу `myday_check`, печатает число строк по таблицам и удаляет её. Хорошо запускать раз в месяц: бэкап, который ни разу не восстанавливали, бэкапом не считается.

Без `snapshot` берётся последний снимок, ID есть в `restic snapshots`.

## Восстановление

```bash
docker compose stop app
```

```bash
docker compose run --rm backup restore apply [snapshot]
```

```bash
docker compose up -d
```

`restore apply` спросит имя базы для подтверждения, развернёт снимок в `myday_restore` и, только если всё встало без ошибок, одной транзакцией поменяет базы местами. Прежняя база остаётся рядом как `myday_before_restore`. Если что-то упадёт до обмена, прод не тронут. `up -d` после восстановления докатит миграции, если снимок старше кода.

Когда убедишься, что всё на месте, удали старую копию:

```bash
docker compose exec db dropdb -U myday myday_before_restore
```

## Если сервера больше нет

Нужны только Google-аккаунт и `BACKUP_PASSWORD`.

1. Развернуть репо, в `.env` тот же `BACKUP_PASSWORD`.
2. `docker compose up -d db`.
3. `rclone config`, как в шаге 2 первой настройки, **с тем же `client_id`** (по умолчанию пустой). Со scope `drive.file` Google показывает приложению только файлы, созданные тем же OAuth-клиентом: с другим `client_id` репозиторий будет не виден.
4. `restore apply`, затем `docker compose up -d`.

## Проверка самого сервиса

```bash
pnpm test:backup
```

Поднимает отдельный compose-проект с локальным репозиторием вместо Drive и прогоняет расписание, `restore check` и `restore apply` на живом Postgres. В CI то же самое делает workflow `backup` на PR, задевающих `docker/backup/` или `docker-compose.yml`.
