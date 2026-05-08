# MyDay

Personal productivity app combining task management and personal finance tracking. Mobile-first, iOS-inspired design with dark/light theme support.

## Stack

- **Frontend:** Nuxt 4 + Vue 3, Tailwind CSS v4, Nuxt UI, Pinia
- **Backend:** Nuxt server (Nitro), Prisma 7 + PostgreSQL
- **Auth:** Email/Password + Google OAuth, JWT (access + refresh)
- **Other:** Zod, PWA

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database

## Setup

```bash
pnpm install
cp .env.example .env   # fill in your values
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NUXT_PUBLIC_APP_URL` | Public app URL |

## Commands

```bash
pnpm dev              # dev server at http://localhost:3000
pnpm build            # production build
pnpm preview          # preview production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check

pnpm prisma generate  # generate Prisma client after schema changes
pnpm prisma migrate dev --name <name>  # create and apply migration
pnpm prisma studio    # database browser UI
pnpm prisma db seed   # seed database
```

## Project structure

```
app/          # client (Vue components, pages, stores, composables)
server/       # server (API routes, middleware, utils)
shared/       # isomorphic (Zod schemas, TypeScript types)
prisma/       # schema, migrations
```

See [CLAUDE.md](CLAUDE.md) for architecture decisions, patterns, and implementation guide.
