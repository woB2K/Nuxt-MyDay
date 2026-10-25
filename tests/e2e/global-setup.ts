import type { FullConfig } from '@playwright/test'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

async function warmUp(config: FullConfig) {
  const { baseURL, launchOptions } = config.projects[0]!.use
  const browser = await chromium.launch(launchOptions)
  const page = await browser.newPage()

  await page.goto(`${baseURL}/auth/welcome`)
  await page.getByText(/Get started|Начнём/).waitFor({ timeout: 120_000 })
  await browser.close()
}

export default async function setup(config: FullConfig) {
  process.loadEnvFile(fileURLToPath(new URL('../../.env.test', import.meta.url)))

  try {
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit', env: process.env })
  } catch {
    throw new Error('Тестовая БД недоступна. Подними её: pnpm test:db:up')
  }

  await warmUp(config)
}
