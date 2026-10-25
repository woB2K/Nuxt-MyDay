# Contributing

Thanks for wanting to help. MyDay is a small project with one maintainer, so a few rules keep it manageable.

## Before you start

- **Bugs:** open an issue with steps to reproduce. A failing test is the best bug report.
- **Features:** open an issue first and describe the problem it solves. MyDay stays deliberately small — a family that runs tasks, habits and a shared budget in one place, not an accounting suite. Multi-currency with conversion, bank sync and attachments are out of scope for now.
- **Security issues:** never in public issues, see [SECURITY.md](SECURITY.md).

## Development setup

You need Node.js 22 or newer, pnpm 10 and Docker (for the test database).

```bash
pnpm install
cp .env.example .env        # point DATABASE_URL at your Postgres
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

Tests:

```bash
pnpm lint && pnpm typecheck
pnpm test                                          # unit
cp .env.test.example .env.test
pnpm test:db:up && pnpm test:integration           # API against a throwaway Postgres
pnpm exec playwright install chromium && pnpm test:e2e
```

`ARCHITECTURE.md` explains the decisions behind the code (family scope, offline queue, security), `DESIGN.md` holds the design tokens and screen specs. Read the relevant section before changing that area.

## Conventions

- **pnpm only.**
- **Every user-visible string goes through `t()`**, with keys in both `i18n/locales/en.json` and `ru.json`. If you don't speak Russian, add the English text to `ru.json` too and say so in the PR.
- **Validation is a Zod schema in `shared/schemas`**, used by both the client and the server.
- **Never trust ids from the request.** `userId` comes from the JWT (`event.context.userId`), finances are scoped by `await getHousehold(event)`, and every relation id in a body is checked against that scope.
- **Server data lives in TanStack Query, Pinia holds only UI state.**
- **No code comments.** Name things so the code reads on its own; explain non-obvious decisions in the PR or in `ARCHITECTURE.md`.
- **Schema changes go through `pnpm prisma migrate dev --name …`.** Never edit an existing migration.

## Pull requests

- Branch off `dev` and open the PR against `dev`; `main` only receives releases.
- Keep one change per PR, with tests where they make sense.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(finance): …`, `fix(auth): …`, `docs: …`. They feed the patch notes.
- CI runs lint, typecheck, unit, integration and E2E tests; a PR is reviewed once it's green.

By contributing you agree that your code is released under the project's license, [AGPL-3.0](LICENSE).
