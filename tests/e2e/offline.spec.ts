import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

async function addExpense(page: Page, amount: string) {
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill(amount)
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()
}

test('трата без сети ждёт в очереди и уходит, как только сеть вернулась', async ({ page, context, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  const net = page.getByTestId('finance-net')
  await expect(net).toHaveText('₽0')

  await context.setOffline(true)
  await addExpense(page, '150')

  await expect(page.getByText('Saved offline. We\'ll sync it once you\'re back online')).toBeVisible()
  const pending = page.getByTestId('outbox-pending')
  await expect(pending).toContainText('Waiting to sync')
  await expect(pending.getByTestId('tx-pending')).toHaveCount(1)
  await expect(net).toHaveText('₽0')

  await context.setOffline(false)

  await expect(page.getByText('1 offline record synced')).toBeVisible()
  await expect(pending).toBeHidden()
  await expect(net).toHaveText('−₽150')
  await expect(page.getByText('-₽150')).toHaveCount(1)
})

test('очередь переживает закрытие приложения и досылается при следующем открытии', async ({ page, context, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await expect(page.getByTestId('finance-net')).toHaveText('₽0')

  await context.setOffline(true)
  await addExpense(page, '275')
  await expect(page.getByTestId('outbox-pending').getByTestId('tx-pending')).toHaveCount(1)
  await page.close()

  await context.setOffline(false)
  const reopened = await context.newPage()
  await reopened.goto('/finance')

  await expect(reopened.getByText('1 offline record synced')).toBeVisible()
  await expect(reopened.getByTestId('outbox-pending')).toBeHidden()
  await expect(reopened.getByTestId('finance-net')).toHaveText('−₽275')
  await expect(reopened.getByText('-₽275')).toHaveCount(1)
})
