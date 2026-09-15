import type { PinStatus, UserSettings } from '../../shared/types'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeEach, describe, expect, it } from 'vitest'
import { authHeaders, prisma, registerUser, resetDb } from './helpers'

const PASSWORD = 'password123'

function setPin(token: string, body: { pin: string, currentPin?: string }) {
  return $fetch<UserSettings>('/api/settings/pin', { method: 'PUT', headers: authHeaders(token), body })
}

function verifyPin(token: string, pin: string) {
  return $fetch<{ ok: true }>('/api/settings/pin/verify', { method: 'POST', headers: authHeaders(token), body: { pin } })
}

function disablePin(token: string, pin: string) {
  return $fetch<UserSettings>('/api/settings/pin', { method: 'DELETE', headers: authHeaders(token), body: { pin } })
}

function resetPin(token: string, password: string) {
  return $fetch<UserSettings>('/api/settings/pin/reset', { method: 'POST', headers: authHeaders(token), body: { password } })
}

function status(token: string) {
  return $fetch<PinStatus>('/api/settings/pin', { headers: authHeaders(token) })
}

async function statusCode(request: Promise<unknown>) {
  return request.then(() => 0).catch((error: { statusCode?: number, status?: number }) =>
    error.statusCode ?? error.status ?? -1)
}

describe('phase 4 pin lock', async () => {
  await setup({
    nuxtConfig: {
      routeRules: { '/': { prerender: false } },
      nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
    }
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('новый аккаунт приходит без PIN, а сброс идёт через пароль', async () => {
    const { token } = await registerUser()

    expect(await status(token)).toEqual({ enabled: false, resetVia: 'password' })
  })

  it('включение PIN пишет хеш, а не сам код', async () => {
    const { token, userId } = await registerUser()

    const settings = await setPin(token, { pin: '1234' })
    const stored = await prisma.appSettings.findUnique({ where: { userId } })

    expect(settings.pinEnabled).toBe(true)
    expect(stored!.pinHash).toBeTruthy()
    expect(stored!.pinHash).not.toContain('1234')
  })

  it('не отдаёт хеш PIN клиенту ни в настройках, ни в профиле', async () => {
    const { token } = await registerUser()
    await setPin(token, { pin: '1234' })

    const settings = await $fetch<UserSettings>('/api/settings', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: { theme: 'light' }
    })
    const profile = await $fetch<{ settings: UserSettings }>('/api/users/me', { headers: authHeaders(token) })

    expect(settings).not.toHaveProperty('pinHash')
    expect(profile.settings).not.toHaveProperty('pinHash')
  })

  it('проверяет верный PIN и отвергает неверный', async () => {
    const { token } = await registerUser()
    await setPin(token, { pin: '1234' })

    expect(await verifyPin(token, '1234')).toEqual({ ok: true })
    expect(await statusCode(verifyPin(token, '4321'))).toBe(401)
  })

  it('проверка без включённого PIN — 409, а не молчаливое «ок»', async () => {
    const { token } = await registerUser()

    expect(await statusCode(verifyPin(token, '1234'))).toBe(409)
  })

  it('смена PIN требует текущий', async () => {
    const { token } = await registerUser()
    await setPin(token, { pin: '1234' })

    expect(await statusCode(setPin(token, { pin: '5678' }))).toBe(400)
    expect(await statusCode(setPin(token, { pin: '5678', currentPin: '0000' }))).toBe(401)

    await setPin(token, { pin: '5678', currentPin: '1234' })

    expect(await verifyPin(token, '5678')).toEqual({ ok: true })
    expect(await statusCode(verifyPin(token, '1234'))).toBe(401)
  })

  it('выключение PIN требует текущий и стирает хеш', async () => {
    const { token, userId } = await registerUser()
    await setPin(token, { pin: '1234' })

    expect(await statusCode(disablePin(token, '9999'))).toBe(401)

    const settings = await disablePin(token, '1234')
    const stored = await prisma.appSettings.findUnique({ where: { userId } })

    expect(settings.pinEnabled).toBe(false)
    expect(stored!.pinHash).toBeNull()
  })

  it('сброс по паролю аккаунта выключает PIN, неверный пароль — нет', async () => {
    const { token, userId } = await registerUser()
    await setPin(token, { pin: '1234' })

    expect(await statusCode(resetPin(token, 'wrong-password'))).toBe(401)
    expect((await prisma.appSettings.findUnique({ where: { userId } }))!.pinEnabled).toBe(true)

    const settings = await resetPin(token, PASSWORD)

    expect(settings.pinEnabled).toBe(false)
    expect((await prisma.appSettings.findUnique({ where: { userId } }))!.pinHash).toBeNull()
  })

  it('чужой PIN не подходит — у соседа он просто не установлен', async () => {
    const owner = await registerUser()
    const stranger = await registerUser()

    await setPin(owner.token, { pin: '1234' })

    expect(await statusCode(verifyPin(stranger.token, '1234'))).toBe(409)
    expect(await status(stranger.token)).toEqual({ enabled: false, resetVia: 'password' })
  })

  it('отвергает всё, что не четыре цифры', async () => {
    const { token } = await registerUser()

    expect(await statusCode(setPin(token, { pin: '123' }))).toBe(400)
    expect(await statusCode(setPin(token, { pin: '12345' }))).toBe(400)
    expect(await statusCode(setPin(token, { pin: 'abcd' }))).toBe(400)
  })

  it('без токена PIN не трогается', async () => {
    expect(await statusCode($fetch('/api/settings/pin', { method: 'PUT', body: { pin: '1234' } }))).toBe(401)
  })

  it('глушит перебор после десяти попыток', async () => {
    const { token } = await registerUser()
    await setPin(token, { pin: '1234' })

    const codes: number[] = []
    for (let attempt = 0; attempt < 12; attempt++) {
      codes.push(await statusCode(verifyPin(token, '0000')))
    }

    expect(codes.slice(0, 10)).toEqual(Array.from({ length: 10 }).fill(401))
    expect(codes.slice(10)).toEqual([429, 429])
  })
})
