import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

async function addExpense(page: Page, amount: string, tag?: string) {
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill(amount)
  await page.locator('button.border-2').first().click()

  if (tag) {
    await page.getByPlaceholder('New tag').fill(tag)
    await page.getByPlaceholder('New tag').press('Enter')
    await expect(page.getByPlaceholder('New tag')).toHaveValue('')
  }

  await page.locator('button[type="submit"]').click()
}

test('тег из шита операции виден в строке и фильтрует итог', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  const net = page.getByTestId('finance-net')

  await addExpense(page, '150', 'Vacation')
  await expect(page.getByTestId('tx-tag')).toHaveText('#Vacation')

  await addExpense(page, '40')
  await expect(net).toHaveText('−₽190')

  await page.getByTestId('filter-tags').click()
  await page.getByRole('button', { name: 'Vacation' }).click()
  await page.getByTestId('tag-filter-apply').click()

  await expect(net).toHaveText('−₽150')
})
