import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const zenmoney = [
  'date;categoryName;payee;comment;outcomeAccountName;outcome;outcomeCurrencyShortTitle;incomeAccountName;income;incomeCurrencyShortTitle',
  '2026-10-01;Продукты;Пятёрочка;;Карта;1250;RUB;Карта;0;RUB',
  '2026-10-02;Food & Drink;;кофе;Карта;150;RUB;Карта;0;RUB',
  '2026-10-03;;;;Карта;5000;RUB;Наличные;5000;RUB'
].join('\n')

test('импорт выгрузки дзен-мани: превью, сопоставление категорий, итог и повтор без дублей', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/settings')
  await page.getByTestId('import-row').click()
  await page.getByTestId('import-file').setInputFiles({ name: 'zen.csv', mimeType: 'text/csv', buffer: Buffer.from(zenmoney) })

  const summary = page.getByTestId('import-summary')
  await expect(summary).toContainText('Format: Zenmoney')
  await expect(summary).toContainText('2 transactions')
  await expect(page.locator('[data-skip="transfer"]')).toContainText('1')
  await expect(page.getByTestId('import-category')).toHaveCount(2)
  const rows = page.getByTestId('import-category')
  await expect(rows.nth(0).locator('select')).toHaveValue('')
  await expect(rows.nth(0)).toContainText('Продукты')
  await expect(rows.nth(1).locator('select')).not.toHaveValue('')

  await page.getByTestId('import-submit').click()
  await expect(page.getByTestId('import-result')).toContainText('Added: 2. Already there: 0. New categories: 1')

  await page.goto('/finance')
  await expect(page.getByTestId('finance-net')).toHaveText('−₽1,400')

  await page.goto('/settings/import')
  await page.getByTestId('import-file').setInputFiles({ name: 'zen.csv', mimeType: 'text/csv', buffer: Buffer.from(zenmoney) })
  await page.getByTestId('import-submit').click()
  await expect(page.getByTestId('import-result')).toContainText('Added: 0. Already there: 2')
})

test('непонятный файл объясняет, что не так', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/settings/import')
  await page.getByTestId('import-file').setInputFiles({ name: 'x.csv', mimeType: 'text/csv', buffer: Buffer.from('hello,world\n1,2') })

  await expect(page.getByTestId('import-unknown')).toBeVisible()
})

test('выгрузка операций в CSV скачивает файл, который импорт понимает', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)
  await loginViaUi(page, email)

  await page.goto('/finance')
  await page.locator('button.fixed').click()
  await page.locator('input[inputmode="decimal"]').fill('150')
  await page.locator('button.border-2').first().click()
  await page.locator('button[type="submit"]').click()
  await expect(page.getByTestId('finance-net')).toHaveText('−₽150')

  await page.goto('/finance/transactions')
  const download = page.waitForEvent('download')
  await page.getByTestId('export-csv').click()
  const file = await download

  expect(file.suggestedFilename()).toMatch(/^myday-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/)
  const csv = readFileSync(await file.path(), 'utf8')
  expect(csv).toContain('date,type,amount,currency,category,tags,notes,author')
  expect(csv).toMatch(/,expense,150,RUB,/)
})
