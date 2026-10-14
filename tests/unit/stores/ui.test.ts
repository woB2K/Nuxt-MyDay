import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from '../../../app/stores/ui'
import { amountsHiddenStorageKey } from '../../../app/utils/privacy'

let savedRandomUUID: typeof globalThis.crypto.randomUUID | undefined

beforeEach(() => {
  setActivePinia(createPinia())
  savedRandomUUID = globalThis.crypto?.randomUUID
})

afterEach(() => {
  if (savedRandomUUID && globalThis.crypto) globalThis.crypto.randomUUID = savedRandomUUID
})

describe('очередь тостов', () => {
  it('складывает тосты с уникальными id', () => {
    const ui = useUiStore()

    ui.addToast({ message: 'Первый', type: 'success' })
    ui.addToast({ message: 'Второй', type: 'error' })

    expect(ui.queue).toHaveLength(2)
    expect(new Set(ui.queue.map(toast => toast.id)).size).toBe(2)
  })

  it('работает без crypto.randomUUID — его нет вне secure context', () => {
    // На http://<LAN-IP> браузер не даёт randomUUID: тост падал с исключением
    // и обрывал onSuccess мутации, из-за чего не закрывались шиты.
    Reflect.deleteProperty(globalThis.crypto, 'randomUUID')

    const ui = useUiStore()

    expect(() => ui.addToast({ message: 'Без crypto', type: 'info' })).not.toThrow()
    expect(ui.queue[0]?.id).toBeTruthy()
  })

  it('убирает тост по id', () => {
    const ui = useUiStore()

    ui.addToast({ message: 'Первый', type: 'success' })
    ui.addToast({ message: 'Второй', type: 'success' })
    ui.removeToast(ui.queue[0]!.id)

    expect(ui.queue.map(toast => toast.message)).toEqual(['Второй'])
  })

  it('даёт тосту длительность по умолчанию, но уважает заданную', () => {
    const ui = useUiStore()

    ui.addToast({ message: 'По умолчанию', type: 'info' })
    ui.addToast({ message: 'Своя', type: 'info', duration: 8000 })

    expect(ui.queue[0]?.duration).toBe(3000)
    expect(ui.queue[1]?.duration).toBe(8000)
  })

  it('тосту с действием даёт 5 секунд — время на «Отменить»', () => {
    const ui = useUiStore()

    ui.addToast({ message: 'Удалено', type: 'success', action: { label: 'Отменить', run: () => {} } })
    ui.addToast({ message: 'Своя', type: 'success', duration: 9000, action: { label: 'Отменить', run: () => {} } })

    expect(ui.queue[0]?.duration).toBe(5000)
    expect(ui.queue[1]?.duration).toBe(9000)
  })

  it('хранит действие тоста', () => {
    const ui = useUiStore()
    const run = () => {}

    ui.addToast({ message: 'Удалено', type: 'success', action: { label: 'Отменить', run } })

    expect(ui.queue[0]?.action).toEqual({ label: 'Отменить', run })
  })
})

describe('privacy mode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('стартует с выбора, сохранённого на устройстве', () => {
    localStorage.setItem(amountsHiddenStorageKey, '1')

    expect(useUiStore().amountsHidden).toBe(true)
  })

  it('переключение пишет выбор в localStorage', () => {
    const ui = useUiStore()

    ui.toggleAmountsHidden()
    expect(ui.amountsHidden).toBe(true)
    expect(localStorage.getItem(amountsHiddenStorageKey)).toBe('1')

    ui.toggleAmountsHidden()
    expect(ui.amountsHidden).toBe(false)
    expect(localStorage.getItem(amountsHiddenStorageKey)).toBe('0')
  })
})
