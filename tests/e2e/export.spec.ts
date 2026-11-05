import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('выгрузка операций в CSV скачивает файл с операциями периода', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill('150')
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()
  await expect(page.getByTestId('finance-net')).toHaveText('−150 ₽')

  await page.goto('/finance/transactions')
  const download = page.waitForEvent('download')
  await page.getByTestId('export-csv').click()
  const file = await download

  expect(file.suggestedFilename()).toMatch(/^myday-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/)
  const csv = readFileSync(await file.path(), 'utf8')
  expect(csv).toContain('date,type,amount,currency,category,tags,notes,author')
  expect(csv).toMatch(/,expense,150,RUB,/)
})

test('выгрузка копилки в CSV скачивает файл с записями периода', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await page.getByRole('button', { name: 'Savings', exact: true }).click()
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.locator('input[inputmode="decimal"]').fill('300')
  await page.locator('button[type="submit"]').click()

  const download = page.waitForEvent('download')
  await page.getByTestId('savings-export-csv').click()
  const file = await download

  expect(file.suggestedFilename()).toMatch(/^myday-savings-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/)
  const csv = readFileSync(await file.path(), 'utf8')
  expect(csv).toContain('date,type,amount,currency,goal,notes,author')
  expect(csv).toMatch(/,deposit,300,RUB,/)
})
