import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from './helpers'

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

// Баг 08.10.2026: на табе «Доходы» разбивка была пустой — сервер считал её только по расходам
test('таб «Доходы» показывает разбивку доходов по категориям', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)

  const login = await request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': fakeIp() },
    data: { email, password: PASSWORD }
  })
  expect(login.status()).toBe(200)
  const { accessToken } = await login.json()
  const auth = { Authorization: `Bearer ${accessToken}` }

  const categoriesResponse = await request.get('/api/categories', { headers: auth })
  expect(categoriesResponse.status()).toBe(200)
  const categories = await categoriesResponse.json()
  const incomeCategory = categories.find((c: { type: string }) => c.type === 'INCOME')
  const created = await request.post('/api/finance/transactions', {
    headers: auth,
    data: { type: 'INCOME', amount: 1000, categoryId: incomeCategory.id, date: new Date().toISOString().slice(0, 10) }
  })
  expect(created.ok()).toBe(true)

  await loginViaUi(page, email)
  await page.goto('/finance')
  await page.getByRole('button', { name: 'Income', exact: true }).click()

  await expect(page.getByText('Income by category')).toBeVisible()
  await expect(page.getByText('No data for this period')).toBeHidden()
})
