import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('логин → добавление транзакции → баланс обновился', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)

  await loginViaUi(page, email)

  await page.goto('/finance')
  const net = page.getByTestId('finance-net')
  await expect(net).toHaveText('0 ₽')

  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill('150')
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()

  await expect(net).toHaveText('−150 ₽')
  await expect(page.getByText('-150 ₽')).toBeVisible()
})
