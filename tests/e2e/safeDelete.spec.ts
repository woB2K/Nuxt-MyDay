import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, registerViaUi, uniqueEmail } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': fakeIp() })
})

async function addTask(page: Page, title: string, tag?: string) {
  await page.locator('button.fixed').click()
  await page.locator('input[type="text"]').first().fill(title)

  if (tag) {
    await page.getByPlaceholder('New tag').fill(tag)
    await page.getByPlaceholder('New tag').press('Enter')
    await expect(page.getByRole('button', { name: tag })).toBeVisible()
  }

  await page.locator('button[type="submit"]').click()
  await expect(page.getByText(title).last()).toBeVisible()
}

async function swipe(page: Page, target: Locator, dx: number) {
  const box = (await target.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y, { steps: 12 })
  await page.mouse.up()
}

test('удалённую задачу возвращает «Undo» в тосте', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await addTask(page, 'Позвонить маме')

  await page.goto('/tasks')
  await swipe(page, page.getByText('Позвонить маме'), -160)

  await expect(page.getByText('Позвонить маме')).toHaveCount(0)
  await expect(page.getByText('Task deleted')).toBeVisible()

  await page.getByRole('button', { name: 'Undo' }).click()

  await expect(page.getByText('Позвонить маме')).toBeVisible()
  await page.goto('/settings/trash')
  await expect(page.getByText('Trash is empty')).toBeVisible()
})

test('удалённая задача лежит в корзине и восстанавливается свайпом вправо', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await addTask(page, 'Сдать отчёт')

  await page.goto('/tasks')
  await swipe(page, page.getByText('Сдать отчёт'), -160)
  await expect(page.getByText('Сдать отчёт')).toHaveCount(0)

  await page.goto('/settings')
  await page.getByText('Recently deleted').click()
  await expect(page).toHaveURL(/\/settings\/trash/)
  await expect(page.getByText('Сдать отчёт')).toBeVisible()
  await expect(page.getByText('30 days left')).toBeVisible()

  await swipe(page, page.getByText('Сдать отчёт'), 160)

  await expect(page.getByText('Task restored')).toBeVisible()
  await expect(page.getByText('Trash is empty')).toBeVisible()
  await page.goto('/tasks')
  await expect(page.getByText('Сдать отчёт')).toBeVisible()
})

test('свайп влево в корзине удаляет навсегда', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await addTask(page, 'Старая заметка')

  await page.goto('/tasks')
  await swipe(page, page.getByText('Старая заметка'), -160)
  await page.goto('/settings/trash')
  await swipe(page, page.getByText('Старая заметка'), -160)

  await expect(page.getByText('Deleted forever')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Trash is empty')).toBeVisible()
  await page.goto('/tasks')
  await expect(page.getByText('Старая заметка')).toHaveCount(0)
})

test('«Empty trash» спрашивает подтверждение, «Cancel» ничего не трогает', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await addTask(page, 'Первая')
  await addTask(page, 'Вторая')

  await page.goto('/tasks')
  await swipe(page, page.getByText('Первая'), -160)
  await swipe(page, page.getByText('Вторая'), -160)
  await page.goto('/settings/trash')

  await page.getByRole('button', { name: 'Empty trash' }).click()
  await expect(page.getByText('2 items will be deleted forever')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByText('Первая')).toBeVisible()

  await page.getByRole('button', { name: 'Empty trash' }).click()
  await page.getByRole('button', { name: 'Delete forever' }).click()

  await expect(page.getByText('Trash is empty')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Trash is empty')).toBeVisible()
})

test('тег удаляется в настройках и пропадает с задачи', async ({ page }) => {
  await registerViaUi(page, uniqueEmail())
  await addTask(page, 'Полить цветы', 'дача')

  await page.goto('/tasks')
  await expect(page.getByText('дача')).toBeVisible()

  await page.goto('/settings')
  await page.getByText('Tags', { exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/tags/)
  await swipe(page, page.getByText('дача'), -160)

  await expect(page.getByText('Tag deleted')).toBeVisible()
  await expect(page.getByText('No tags yet')).toBeVisible()
  await page.goto('/tasks')
  await expect(page.getByText('Полить цветы')).toBeVisible()
  await expect(page.getByText('дача')).toHaveCount(0)
})
