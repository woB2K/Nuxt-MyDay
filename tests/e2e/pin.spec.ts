import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const PIN = '2468'

async function typePin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.getByRole('button', { name: digit, exact: true }).click()
  }
}

test('включение PIN → перезапуск приложения → экран блокировки', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.goto('/settings')
  await page.getByRole('switch').click()

  await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible()
  await typePin(page, PIN)
  await typePin(page, PIN)

  await expect(page.getByRole('button', { name: '1', exact: true })).toBeHidden()
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  await expect(page).toHaveURL(/\/settings/)

  await page.reload()

  await expect(page).toHaveURL(/\/auth\/pin/)
  await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible()

  await typePin(page, '1111')
  await expect(page.getByText(/Wrong PIN|Неверный PIN/)).toBeVisible()
  await expect(page).toHaveURL(/\/auth\/pin/)

  await typePin(page, PIN)

  await expect(page).toHaveURL(/\/settings/)
  await expect(page.getByRole('switch')).toBeVisible()
})

test('заблокированное приложение не пускает на защищённые маршруты по прямой ссылке', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.goto('/settings')
  await page.getByRole('switch').click()
  await typePin(page, PIN)
  await typePin(page, PIN)
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true')

  await page.reload()
  await expect(page).toHaveURL(/\/auth\/pin/)

  await page.goto('/finance')
  await expect(page).toHaveURL(/\/auth\/pin/)

  await typePin(page, PIN)
  await expect(page).toHaveURL(/\/finance/)
})
