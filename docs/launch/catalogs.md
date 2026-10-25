# 10.16 — каталоги и one-click

Черновики заявок. Подавать после релиза, когда образы лежат в GHCR, а демо доступно по ссылке. Если проект переименуется (10.1), заменить имя и ссылки.

## awesome-selfhosted

Репозиторий `awesome-selfhosted/awesome-selfhosted-data`, одна запись — YAML-файл в `software/`. Требования по памяти — заметный возраст с первого релиза (несколько месяцев), активная поддержка, рабочая инструкция по установке, свободная лицензия; перед подачей сверить с их актуальным `CONTRIBUTING.md`. Категория — **Personal Dashboards** или **Money, Budgeting & Management**; лучше вторая, там ищут.

```yaml
name: "MyDay"
website_url: "https://github.com/woB2K/Nuxt-MyDay"
source_code_url: "https://github.com/woB2K/Nuxt-MyDay"
description: "Shared family budget, tasks and habits in one mobile-first PWA, with offline entry and CSV import."
licenses:
  - AGPL-3.0
platforms:
  - Nodejs
  - Docker
tags:
  - Money, Budgeting & Management
demo_url: "<ссылка на демо>"
```

## selfh.st

Форма на сайте (Apps → Submit). Короткое описание (до ~150 символов): «Tasks, habits and a shared family budget in one self-hosted PWA — one command to set up, works offline on the phone.» Скриншот — `docs/screenshots/en/finance.png`.

## Umbrel

Своё приложение — PR в `getumbrel/umbrel-apps`: папка с `umbrel-app.yml` и `docker-compose.yml`. Особенности: Umbrel сам проксирует HTTPS и даёт свой app proxy, поэтому профиль `caddy` не нужен, `NUXT_PROXY_HOPS=1`; секреты задаются через `${APP_SEED}`; данные — в `${APP_DATA_DIR}`. Нужны иконка 256×256 и 3–5 скриншотов 1440×900 — потребуется десктопная раскладка скриншотов.

## CasaOS

PR в `IceWhaleTech/CasaOS-AppStore`: `docker-compose.yml` с блоком `x-casaos` (иконка, категория Finance, порт, описания на нескольких языках, включая `ru_RU`). Удобно: CasaOS показывает переменные окружения формой — подойдёт `ALLOW_REGISTRATION`.

## PikaPods

Добавляют сами по заявке (форма на сайте или письмо). Им важны: один контейнер приложения + Postgres, переменные окружения, health-check (у образа есть `HEALTHCHECK`), том для данных. Наш `migrate` выполняется до `app` — описать это в заявке, либо до подачи сделать запуск миграций из самого `app`.
