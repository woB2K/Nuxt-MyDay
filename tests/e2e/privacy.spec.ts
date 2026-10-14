import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('тап по балансу прячет суммы и помнит выбор после перезагрузки', async ({ page, request }) => {
  const email = uniqueEmail()
  await registerViaApi(request, email)

  const login = await request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': fakeIp() },
    data: { email, password: PASSWORD }
  })
  expect(login.status()).toBe(200)
  const { accessToken } = await login.json()
  const auth = { Authorization: `Bearer ${accessToken}` }

  const categories = await (await request.get('/api/categories', { headers: auth })).json()
  const expenseCategory = categories.find((c: { type: string }) => c.type === 'EXPENSE')
  const created = await request.post('/api/finance/transactions', {
    headers: auth,
    data: { type: 'EXPENSE', amount: 150, categoryId: expenseCategory.id, date: new Date().toISOString().slice(0, 10) }
  })
  expect(created.ok()).toBe(true)

  await loginViaUi(page, email)
  await page.goto('/finance')

  const net = page.getByTestId('finance-net')
  const amounts = page.locator('body')
  await expect(net).toHaveText('−150 ₽')
  await expect(page.getByText('-150 ₽')).toBeVisible()

  await net.click()

  await expect(net.getByTestId('money-hidden')).toBeVisible()
  await expect(net).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Amounts hidden')).toBeVisible()
  await expect(amounts).not.toContainText(/\d\s₽/, { useInnerText: true })

  await page.reload()

  await expect(net.getByTestId('money-hidden')).toBeVisible()
  await expect(amounts).not.toContainText(/\d\s₽/, { useInnerText: true })

  await net.click()

  await expect(net).toHaveText('−150 ₽')
  await expect(net).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText('-150 ₽')).toBeVisible()
})
