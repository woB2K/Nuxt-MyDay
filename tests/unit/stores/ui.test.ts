import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from '../../../app/stores/ui'

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
})
