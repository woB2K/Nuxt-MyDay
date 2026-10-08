import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const desktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test.describe('iPhone в Safari', () => {
  test.use({ userAgent: iphone })

  test('на Welcome гайд открывается с пояснением про повторный вход', async ({ page }) => {
    await page.goto('/auth/welcome')
    await page.getByText('Install MyDay first').click()

    await expect(page.getByText('3 steps in Safari')).toBeVisible()
    await expect(page.getByText(/doesn’t share your Safari session/)).toBeVisible()
  })

  test('закрытый баннер на Today не возвращается после перезагрузки, строка в настройках остаётся', async ({ page }) => {
    await registerViaUi(page, uniqueEmail())

    const banner = page.getByText('How to install')

    await expect(banner).toBeVisible()
    await page.getByLabel('Hide').click()
    await expect(banner).toHaveCount(0)

    await page.reload()
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible()
    await expect(banner).toHaveCount(0)

    await page.goto('/settings')
    await page.getByText('Install app').click()
    await expect(page.getByText('3 steps in Safari')).toBeVisible()
  })
})

test.describe('Android', () => {
  test('кнопка «Установить» вызывает системный диалог и показывает успех', async ({ page }) => {
    await page.goto('/auth/welcome')
    await page.getByText('Install MyDay first').waitFor()

    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true })

      Object.assign(event, {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      })
      window.dispatchEvent(event)
    })

    await page.getByText('Install MyDay first').click()
    await page.locator('.z-50').getByRole('button', { name: /^Install$/ }).click()

    await expect(page.getByText('Done, MyDay is on your Home Screen')).toBeVisible()
  })
})

test.describe('десктоп', () => {
  test.use({ userAgent: desktop })

  test('не предлагает установку', async ({ page }) => {
    await page.goto('/auth/welcome')

    await expect(page.getByText(/Get started|Начнём/)).toBeVisible()
    await expect(page.getByText('Install MyDay first')).toHaveCount(0)
  })
})
