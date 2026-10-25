import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('смена валюты в настройках меняет знак у всех сумм, но не сами суммы', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill('150')
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()
  await expect(page.getByTestId('finance-net')).toHaveText('−₽150')

  await page.goto('/settings')
  await expect(page.getByTestId('currency-row')).toContainText('Russian Ruble')
  await page.getByTestId('currency-row').click()
  await page.locator('[data-currency="EUR"]').click()
  await expect(page.getByText('Currency: Euro')).toBeVisible()
  await expect(page.getByTestId('currency-row')).toContainText('Euro · EUR')

  await page.goto('/finance')
  await expect(page.getByTestId('finance-net')).toHaveText('−€150')
  await expect(page.getByText('-€150')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('finance-net')).toHaveText('−€150')
})
