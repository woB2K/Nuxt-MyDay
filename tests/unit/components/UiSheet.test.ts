import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UiSheet from '../../../app/components/ui/UiSheet.vue'

const DISMISS = 96

let sheet: ReturnType<typeof mount> | null = null

afterEach(() => {
  sheet?.unmount()
  sheet = null
  document.body.innerHTML = ''
})

function mountSheet(open = true, slots: Record<string, string> = {}) {
  sheet = mount(UiSheet, {
    props: { open, title: 'Sheet' },
    slots: { default: '<p>body</p>', ...slots }
  })

  return sheet
}

function query(selector: string) {
  const element = document.body.querySelector(selector)

  if (!element) throw new Error(`не найдено: ${selector}`)

  return element
}

async function fire(selector: string, type: string, init: Record<string, unknown> = {}) {
  const event = new Event(type, { bubbles: true })

  Object.assign(event, init)
  query(selector).dispatchEvent(event)
  await nextTick()
}

async function pull(dy: number) {
  await fire('.touch-none', 'pointerdown', { clientY: 0 })
  await fire('.touch-none', 'pointermove', { clientY: dy })
  await fire('.touch-none', 'pointerup')
}

function shiftOf(selector: string) {
  const style = query(selector).getAttribute('style')

  return Number(style?.match(/translateY\((-?[\d.]+)px\)/)?.[1] ?? 0)
}

describe('uiSheet', () => {
  it('закрывается протяжкой вниз за порог', async () => {
    vi.useFakeTimers()
    const wrapper = mountSheet()

    await pull(DISMISS + 20)
    expect(wrapper.emitted('update:open')).toBeUndefined()

    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('update:open')).toEqual([[false]])

    vi.useRealTimers()
  })

  it('возвращается на место, если протяжка не дошла до порога', async () => {
    const wrapper = mountSheet()

    await pull(DISMISS - 20)

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(query('.z-50').getAttribute('style')).toBeNull()
  })

  it('следует за пальцем вниз и тормозит резинкой вверх', async () => {
    mountSheet()

    await fire('.touch-none', 'pointerdown', { clientY: 0 })

    await fire('.touch-none', 'pointermove', { clientY: 60 })
    expect(shiftOf('.z-50')).toBe(60)

    await fire('.touch-none', 'pointermove', { clientY: -100 })
    expect(shiftOf('.z-50')).toBeGreaterThan(-100)
  })

  it('закрывается по Escape', async () => {
    const wrapper = mountSheet(false)

    await wrapper.setProps({ open: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('закрепляет футер внизу и отдаёт ему отступ safe-area', () => {
    mountSheet(true, { footer: '<button>apply</button>' })

    const footer = query('[data-testid="sheet-footer"]')

    expect(footer.classList).toContain('sticky')
    expect(footer.classList).toContain('pb-safe')
    expect(footer.textContent).toContain('apply')
    expect(document.body.querySelectorAll('.pb-safe')).toHaveLength(1)
  })

  it('без футера отступ safe-area остаётся у контента', () => {
    mountSheet()

    expect(document.body.querySelector('[data-testid="sheet-footer"]')).toBeNull()
    expect(document.body.querySelectorAll('.pb-safe')).toHaveLength(1)
  })

  it('снимает блокировку скролла при размонтировании', async () => {
    const wrapper = mountSheet(false)

    await wrapper.setProps({ open: true })
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
