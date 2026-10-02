import type { APIRequestContext, Page } from '@playwright/test'

export const PASSWORD = 'password123'

let counter = 0

export function uniqueEmail(): string {
  counter += 1

  return `e2e-${Date.now()}-${counter}@test.local`
}

export function fakeIp(): string {
  counter += 1

  return `10.20.${Math.floor(counter / 250)}.${counter % 250}`
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
