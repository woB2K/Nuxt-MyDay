import { describe, expect, it } from 'vitest'
import {
  detectInstallDevice,
  dismissInstallBanner,
  emptyInstallMemory,
  isInstallBannerDue,
  maxBannerDismissals,
  parseInstallMemory
} from '../../../app/utils/pwaInstall'

const day = 24 * 60 * 60 * 1000
const now = Date.UTC(2026, 9, 8)

const ua = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.6668.69 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  ipadDesktopMode: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  androidPhone: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  androidTablet: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  otherMobile: 'Mozilla/5.0 (Mobile; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
}

describe('detectInstallDevice', () => {
  it('отличает Safari на iPhone от других браузеров', () => {
    expect(detectInstallDevice(ua.iphoneSafari)).toEqual({ platform: 'ios', browser: 'safari' })
    expect(detectInstallDevice(ua.iphoneChrome)).toEqual({ platform: 'ios', browser: 'other' })
  })

  it('узнаёт Android-телефон', () => {
    expect(detectInstallDevice(ua.androidPhone)?.platform).toBe('android')
  })

  it('прочий мобильный браузер — платформа не определена', () => {
    expect(detectInstallDevice(ua.otherMobile)?.platform).toBe('unknown')
  })

  it('не предлагает установку на планшетах и десктопе', () => {
    expect(detectInstallDevice(ua.ipad)).toBeNull()
    expect(detectInstallDevice(ua.ipadDesktopMode)).toBeNull()
    expect(detectInstallDevice(ua.androidTablet)).toBeNull()
    expect(detectInstallDevice(ua.desktop)).toBeNull()
  })
})

describe('parseInstallMemory', () => {
  it('пустое или битое значение даёт чистое состояние', () => {
    expect(parseInstallMemory(null)).toEqual(emptyInstallMemory())
    expect(parseInstallMemory('{oops')).toEqual(emptyInstallMemory())
  })

  it('отбрасывает поля неверного типа', () => {
    expect(parseInstallMemory('{"dismissCount":"2","snoozeUntil":null,"installed":"yes"}')).toEqual(emptyInstallMemory())
  })

  it('читает сохранённое состояние', () => {
    const memory = { dismissCount: 1, snoozeUntil: now, installed: true }

    expect(parseInstallMemory(JSON.stringify(memory))).toEqual(memory)
  })
})

describe('баннер установки', () => {
  it('скрывается на 14 дней, потом на 30, после третьего закрытия — навсегда', () => {
    let memory = dismissInstallBanner(emptyInstallMemory(), now)

    expect(memory.snoozeUntil).toBe(now + 14 * day)
    expect(isInstallBannerDue(memory, now + 14 * day - 1)).toBe(false)
    expect(isInstallBannerDue(memory, now + 14 * day)).toBe(true)

    memory = dismissInstallBanner(memory, now)

    expect(memory.snoozeUntil).toBe(now + 30 * day)
    expect(isInstallBannerDue(memory, now + 30 * day)).toBe(true)

    memory = dismissInstallBanner(memory, now)

    expect(memory.dismissCount).toBe(maxBannerDismissals)
    expect(isInstallBannerDue(memory, now + 365 * day)).toBe(false)
  })

  it('не показывается после установки', () => {
    expect(isInstallBannerDue({ ...emptyInstallMemory(), installed: true }, now)).toBe(false)
  })
})
