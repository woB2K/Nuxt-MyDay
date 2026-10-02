import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

const sheet = (page: Page) => page.locator('.z-50')

async function openViaFab(page: Page) {
  await page.locator('button.fixed.right-5').click()
  await expect(sheet(page)).toBeVisible()
}

async function dismiss(page: Page) {
  await page.locator('.z-40').first().click({ position: { x: 8, y: 8 } })
  await expect(sheet(page)).toHaveCount(0)
}

test('FAB продолжает работать после перехода между вкладками', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await openViaFab(page)
  await dismiss(page)

  for (const href of ['/tasks', '/finance', '/today']) {
    await page.locator(`a[href="${href}"]`).click()
    await expect(page).toHaveURL(new RegExp(href))

    await openViaFab(page)
    await dismiss(page)
  }
})

test('через FAB можно создать задачу со страницы, открытой переходом', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())

  await page.locator('a[href="/tasks"]').click()
  await expect(page).toHaveURL(/\/tasks/)

  await openViaFab(page)
  await sheet(page).locator('input[type="text"]').first().fill('Задача из таба')
  await sheet(page).locator('button[type="submit"]').click()

  await expect(page.getByText('Задача из таба')).toBeVisible()
})
