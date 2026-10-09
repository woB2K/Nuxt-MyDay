import type { APIRequestContext, Page } from '@playwright/test'
import { randomInt, randomUUID } from 'node:crypto'

export const PASSWORD = 'password123'

export function uniqueEmail(): string {
  return `e2e-${randomUUID()}@test.local`
}

export function fakeIp(): string {
  return `10.${randomInt(20, 250)}.${randomInt(0, 250)}.${randomInt(1, 250)}`
}

export async function registerViaApi(request: APIRequestContext, email: string) {
  const response = await request.post('/api/auth/register', {
    headers: { 'x-forwarded-for': fakeIp() },
    data: { name: 'E2E User', email, password: PASSWORD }
  })

  if (!response.ok()) throw new Error(`register failed: ${response.status()}`)
}

export async function registerViaUi(page: Page, email: string) {
  await page.goto('/auth/register')
  await page.locator('input[type="text"]').fill('E2E User')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/today')
}

export async function loginViaUi(page: Page, email: string) {
  await page.goto('/auth/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/today')
}
