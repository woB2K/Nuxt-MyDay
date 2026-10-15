import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const NAME = 'Gym'

test('привычка «3 раза в неделю»: создание с «Сегодня», отметка кольцом, список и экран привычки', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.locator('[data-empty] [data-add]').click()
  await page.locator('input[type="text"]').fill(NAME)
  await page.locator('[data-icon="biceps-flexed"]').click()
  await page.locator('[data-color="red"]').click()
  await page.locator('[data-schedule="weekly"]').click()
  await expect(page.locator('[data-per-week] [data-count]')).toHaveText('3')
  await page.locator('button[type="submit"]').click()

  const ring = page.getByRole('button', { name: NAME })
  await expect(ring).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('[data-open-list] [data-progress]')).toHaveText('Week · 0 / 1')

  await ring.click()

  await expect(ring).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: NAME })).toHaveAttribute('aria-pressed', 'true')

  await page.locator('[data-open-list]').click()
  await page.waitForURL('**/habits')

  const row = page.locator('[data-habit-row]').filter({ hasText: NAME })
  await expect(row.locator('[data-plan]')).toHaveText('3× a week')
  await expect(page.locator('[data-subtitle]')).toHaveText('This week 0 of 1 on plan')

  await row.click()
  await page.waitForURL('**/habits/*')

  await expect(page.locator('[data-mark-today]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-week-line]')).toHaveText(/This week: 1 of 3|2 more by Sunday/)

  await page.locator('[data-mark-today]').click()

  await expect(page.locator('[data-mark-today]')).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await expect(page.locator('[data-mark-today]')).toHaveAttribute('aria-pressed', 'false')
})

test('удалённую привычку возвращает «Undo» в тосте', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.locator('[data-empty] [data-add]').click()
  await page.locator('input[type="text"]').fill(NAME)
  await page.locator('button[type="submit"]').click()
  await page.getByRole('button', { name: NAME }).click({ delay: 600 })
  await page.waitForURL('**/habits/*')

  await page.locator('[data-delete]').click()
  await page.waitForURL('**/habits')
  await expect(page.locator('[data-habit-row]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Undo' }).click()

  await expect(page.locator('[data-habit-row]').filter({ hasText: NAME })).toBeVisible()
})

test('пустой вход на «Сегодня» прячется крестиком и возвращается переключателем в настройках', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.locator('[data-empty] [data-hide]').click()
  await expect(page.locator('[data-empty]')).toHaveCount(0)

  await page.goto('/settings')
  const toggle = page.locator('[data-habits-on-today]')
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'true')

  await page.goto('/today')
  await expect(page.locator('[data-empty]')).toBeVisible()
})
