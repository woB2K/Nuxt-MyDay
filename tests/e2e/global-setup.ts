import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export default function setup() {
  process.loadEnvFile(fileURLToPath(new URL('../../.env.test', import.meta.url)))

  try {
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit', env: process.env })
  } catch {
    throw new Error('Тестовая БД недоступна. Подними её: pnpm test:db:up')
  }
}
