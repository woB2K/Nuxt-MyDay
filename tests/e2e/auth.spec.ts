import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': fakeIp() })
})

test('регистрация на занятый email показывает ошибку под полем email', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)

  await page.goto('/auth/register')
  await page.locator('input[type="text"]').fill('Second User')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.locator('button[type="submit"]').click()

  await expect(page.getByText('This email is already registered.')).toBeVisible()
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
  await expect(page).toHaveURL(/\/auth\/register/)
})

// Баг 14.10.2026 на проде: после выхода и регистрации второго аккаунта без перезагрузки страницы были видны операции первого
test('после выхода новый аккаунт не видит данные прошлого', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.getByRole('link', { name: 'Finance' }).click()
  await expect(page.getByTestId('finance-net')).toHaveText('0 ₽')
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill('150')
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()
  await expect(page.getByText('-150 ₽')).toBeVisible()

  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL('**/auth/welcome')

  await page.getByRole('link', { name: 'Continue with email' }).click()
  await page.locator('input[type="text"]').fill('Second User')
  await page.locator('input[type="email"]').fill(uniqueEmail())
  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/today')

  await page.getByRole('link', { name: 'Finance' }).click()
  await expect(page.getByTestId('finance-net')).toHaveText('0 ₽')
  await expect(page.getByText('-150 ₽')).toHaveCount(0)
})

test('выход в одной вкладке выводит из аккаунта и остальные', async ({ page, context, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  const other = await context.newPage()
  await other.goto('/settings')
  await other.getByRole('button', { name: 'Sign out' }).click()
  await other.waitForURL('**/auth/welcome')

  await page.waitForURL('**/auth/welcome')
})
