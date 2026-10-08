import { expect, test } from '@playwright/test'
import pkg from '../../package.json' with { type: 'json' }
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('из настроек открывается «Что нового» с текущей версией', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await page.goto('/settings')

  await expect(page.getByText(`Version ${pkg.version}`)).toBeVisible()
  await page.getByText('What\'s new').click()

  await expect(page).toHaveURL(/\/settings\/changelog/)
  await expect(page.getByText(`Current version ${pkg.version}`)).toBeVisible()
  await expect(page.getByTestId('release').first()).toContainText(pkg.version)
})
