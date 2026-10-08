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

// 08.10.2026: первые 245к считались пополнением, и бейдж оставался в плюсе, даже когда с них только снимали
test('стартовый остаток не пополнение: снятие с него уводит бейдж в минус', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)

  await loginViaUi(page, email)
  await page.goto('/finance')
  await page.getByRole('button', { name: 'Savings', exact: true }).click()

  await page.getByRole('button', { name: 'Set opening balance' }).click()
  await page.locator('input[inputmode="decimal"]').fill('245000')
  await expect(page.locator('input[inputmode="decimal"]')).toHaveValue('245 000')
  await page.locator('button[type="submit"]').click()
  await expect(page.getByRole('button', { name: 'Set opening balance' })).toBeHidden()

  await page.getByRole('button', { name: 'Withdraw', exact: true }).click()
  await page.locator('input[inputmode="decimal"]').fill('15000')
  await page.locator('button[type="submit"]').click()

  await expect(page.getByText('230 000 ₽', { exact: true })).toBeVisible()
  await expect(page.locator('span.rounded-full', { hasText: '−15 000 ₽' })).toBeVisible()
})
