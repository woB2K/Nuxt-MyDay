import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const PROTECTED = ['/today', '/tasks', '/tasks/templates', '/finance', '/finance/transactions', '/settings', '/settings/categories']

test('аноним не попадает ни на один защищённый маршрут', async ({ page }) => {
  for (const path of PROTECTED) {
    await page.goto(path)
    await expect(page, `${path} пустил анонима`).toHaveURL(/\/auth\/welcome/)
  }
})

test('корень тоже уводит анонима на welcome, а не на пустой Today', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/auth\/welcome/)
})

test('залогиненного не пускают обратно на формы входа', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  for (const path of ['/auth/welcome', '/auth/login', '/auth/register']) {
    await page.goto(path)
    await expect(page, `${path} показал форму входа залогиненному`).toHaveURL(/\/today/)
  }
})

test('после выхода защищённые маршруты снова закрыты', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.goto('/settings')
  await page.getByText(/Sign out|Выйти/).click()
  await expect(page).toHaveURL(/\/auth\/welcome/)

  await page.goto('/finance')
  await expect(page).toHaveURL(/\/auth\/welcome/)
})
