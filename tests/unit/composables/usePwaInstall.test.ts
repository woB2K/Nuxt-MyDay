import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installStorageKey, startPwaInstall, usePwaInstall } from '../../../app/composables/usePwaInstall'

const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'
const desktop = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

function start(userAgent: string, standalone = false) {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: standalone, media: query }) as MediaQueryList)

  startPwaInstall()

  return usePwaInstall()
}

function promptEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true })

  return Object.assign(event, {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome })
  })
}

function stored() {
  return JSON.parse(localStorage.getItem(installStorageKey) ?? 'null')
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePwaInstall', () => {
  it('предлагает установку только в мобильном браузере вне standalone', () => {
    expect(start(iphone).eligible.value).toBe(true)
    expect(start(iphone, true).eligible.value).toBe(false)
    expect(start(desktop).eligible.value).toBe(false)
  })

  it('перехватывает beforeinstallprompt и ставит приложение по кнопке', async () => {
    const pwa = start(android)
    const event = promptEvent('accepted')

    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(pwa.canPrompt.value).toBe(true)
    expect(await pwa.install()).toBe('accepted')
    expect(event.prompt).toHaveBeenCalledOnce()
    expect(pwa.canPrompt.value).toBe(false)
    expect(pwa.promptDismissed.value).toBe(false)
  })

  it('после отказа в системном диалоге переходит на запасные шаги', async () => {
    const pwa = start(android)

    window.dispatchEvent(promptEvent('dismissed'))

    expect(await pwa.install()).toBe('dismissed')
    expect(pwa.canPrompt.value).toBe(false)
    expect(pwa.promptDismissed.value).toBe(true)
    expect(await pwa.install()).toBe('unavailable')
  })

  it('appinstalled запоминает установку и убирает все точки входа', () => {
    const pwa = start(android)

    window.dispatchEvent(new Event('appinstalled'))

    expect(pwa.installed.value).toBe(true)
    expect(pwa.eligible.value).toBe(false)
    expect(stored().installed).toBe(true)
    expect(start(android).eligible.value).toBe(false)
  })

  it('закрытие баннера переживает перезапуск', () => {
    const pwa = start(iphone)

    expect(pwa.bannerVisible.value).toBe(true)

    pwa.dismissBanner()

    expect(pwa.bannerVisible.value).toBe(false)
    expect(stored().dismissCount).toBe(1)
    expect(start(iphone).bannerVisible.value).toBe(false)
  })

  it('битый localStorage не ломает старт', () => {
    localStorage.setItem(installStorageKey, '{oops')

    expect(start(iphone).bannerVisible.value).toBe(true)
  })
})
