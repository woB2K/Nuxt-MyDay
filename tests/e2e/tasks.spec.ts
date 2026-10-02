import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const TITLE = 'Купить молоко'

test('регистрация → создание задачи → отметка о выполнении', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.locator('button.fixed').click()
  await page.locator('input[type="text"]').first().fill(TITLE)
  await page.locator('button[type="submit"]').click()

  const row = page.getByText(TITLE).last()
  await expect(row).toBeVisible()
  await expect(page.locator('.line-through')).toHaveCount(0)

  await page.locator('button.border-2').last().click()

  await expect(page.locator('.line-through')).toHaveText(TITLE)

  await page.reload()

  await expect(page.locator('.line-through')).toHaveText(TITLE)
})
