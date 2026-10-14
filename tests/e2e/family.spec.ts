import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { fakeIp, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from './helpers'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })

test('приглашение по ссылке: гость регистрируется, вступает и видит общие финансы', async ({ page, browser, request }) => {
  const ownerEmail = uniqueEmail()
  await registerViaApi(request, ownerEmail)
  await loginViaUi(page, ownerEmail)

  await page.goto('/settings/family')
  await page.getByTestId('family-invite').click()
  await page.getByTestId('invite-create').click()

  const link = (await page.getByTestId('invite-link').textContent())!.trim()
  expect(link).toContain('/family/join/')

  const guestContext = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })
  const guest = await guestContext.newPage()

  await guest.goto(link)
  await guest.waitForURL('**/auth/welcome')
  await expect(guest.getByTestId('welcome-invite')).toContainText('E2E User')

  await guest.goto('/auth/register')
  await guest.locator('input[type="text"]').fill('Guest')
  await guest.locator('input[type="email"]').fill(uniqueEmail())
  await guest.locator('input[type="password"]').fill(PASSWORD)
  await guest.locator('button[type="submit"]').click()

  await guest.waitForURL('**/family/join/**')
  await guest.getByTestId('join-confirm').click()
  await guest.getByTestId('join-open-finance').click()

  await guest.waitForURL('**/finance')
  await expect(guest.getByTestId('finance-family')).toBeVisible()
  await expect(guest.getByTestId('filter-mine')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('family-member')).toHaveCount(2)

  await guest.goto(link)
  await expect(guest.getByTestId('join-invalid')).toBeVisible()

  await guestContext.close()
})

test('исключённый узнаёт об этом тостом при следующем открытии', async ({ page, browser, request }) => {
  const ownerEmail = uniqueEmail()
  const memberEmail = uniqueEmail()
  await registerViaApi(request, ownerEmail)
  await registerViaApi(request, memberEmail)

  const tokens: Record<string, string> = {}
  for (const email of [ownerEmail, memberEmail]) {
    const login = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': fakeIp() }, data: { email, password: PASSWORD } })
    tokens[email] = (await login.json()).accessToken
  }

  const auth = (email: string) => ({ Authorization: `Bearer ${tokens[email]}` })
  const invite = await (await request.post('/api/household/invite', { headers: auth(ownerEmail) })).json()
  await request.post('/api/household/join', { headers: auth(memberEmail), data: { token: invite.token } })

  await loginViaUi(page, ownerEmail)
  await page.goto('/settings/family')
  await page.getByTestId('family-member-more').click()
  await page.getByTestId('member-remove').click()
  await page.getByTestId('member-remove-confirm').click()
  await expect(page.getByTestId('family-member')).toHaveCount(0)

  const memberContext = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })
  const member = await memberContext.newPage()
  await loginViaUi(member, memberEmail)

  await expect(member.getByText('You were removed from the family')).toBeVisible()

  await memberContext.close()
})

async function familyOfTwo(request: APIRequestContext) {
  const ownerEmail = uniqueEmail()
  const memberEmail = uniqueEmail()
  await registerViaApi(request, ownerEmail)
  await registerViaApi(request, memberEmail)

  const headers: Record<string, { Authorization: string }> = {}
  for (const email of [ownerEmail, memberEmail]) {
    const login = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': fakeIp() }, data: { email, password: PASSWORD } })
    headers[email] = { Authorization: `Bearer ${(await login.json()).accessToken}` }
  }

  const invite = await (await request.post('/api/household/invite', { headers: headers[ownerEmail] })).json()
  await request.post('/api/household/join', { headers: headers[memberEmail], data: { token: invite.token } })

  const categories = await (await request.get('/api/categories', { headers: headers[ownerEmail] })).json()
  const food = categories.find((category: { key: string | null }) => category.key === 'food')
  const spend = (email: string, amount: number) => request.post('/api/finance/transactions', {
    headers: headers[email],
    data: { type: 'EXPENSE', amount, categoryId: food.id, date: new Date().toISOString().slice(0, 10) }
  })
  await spend(ownerEmail, 100)
  await spend(memberEmail, 30)

  const amounts = async (email: string) => {
    const { data } = await (await request.get('/api/finance/transactions', { headers: headers[email] })).json()
    return data.map((tx: { amount: number }) => tx.amount).sort()
  }

  return { ownerEmail, memberEmail, amounts }
}

test('записи ушедшего помечены бывшим участником, даже когда в семье никого не осталось', async ({ page, browser, request }) => {
  const { ownerEmail, memberEmail, amounts } = await familyOfTwo(request)

  await loginViaUi(page, memberEmail)
  await page.goto('/settings/family')
  await page.getByTestId('family-leave').click()
  await page.getByTestId('leave-confirm').click()
  await expect(page.getByTestId('family-invite')).toBeVisible()

  expect(await amounts(ownerEmail)).toEqual([100, 30].sort())

  const ownerContext = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': fakeIp() } })
  const owner = await ownerContext.newPage()
  await loginViaUi(owner, ownerEmail)
  await owner.goto('/finance')

  await expect(owner.getByText('-30 ₽')).toBeVisible()
  await expect(owner.getByTestId('tx-author')).toHaveCount(1)

  await ownerContext.close()
})
