import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// globalSetup выполняется один раз в главном процессе (без setupFiles),
// поэтому env грузим повторно. Накатываем схему на тестовую БД — чтобы
// прогон работал на свежем контейнере без ручного migrate.
export default function setup() {
  process.loadEnvFile(fileURLToPath(new URL('../../.env.test', import.meta.url)))
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit', env: process.env })
}
