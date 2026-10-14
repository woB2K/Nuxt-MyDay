import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('цель накоплений: создание, пополнение в цель и прогресс', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await page.getByRole('button', { name: 'Savings', exact: true }).click()

  await page.getByTestId('goal-add').click()
  await page.locator('input[type="text"]').first().fill('Bike')
  await page.locator('input[inputmode="decimal"]').fill('10000')
  await page.getByTestId('goal-deadline').fill('2099-01-31')
  await page.getByTestId('goal-save').click()

  const row = page.getByTestId('goal-row')
  await expect(row).toContainText('Bike')
  await expect(page.getByTestId('goal-saved')).toHaveText(/^0 ₽ of 10.000 ₽$/)

  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.locator('input[inputmode="decimal"]').fill('2500')
  await page.getByTestId('savings-goal-picker').getByRole('button', { name: 'Bike' }).click()
  await page.locator('button[type="submit"]').click()

  await expect(page.getByTestId('goal-saved')).toHaveText(/^2.500 ₽ of 10.000 ₽$/)
  await expect(row).toContainText('25%')
})
