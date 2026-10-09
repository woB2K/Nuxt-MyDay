import { expect, test } from '@playwright/test'
import { fakeIp, PASSWORD, registerViaApi, uniqueEmail } from './helpers'

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
