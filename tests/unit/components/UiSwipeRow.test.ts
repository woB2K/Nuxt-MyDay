import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiSwipeRow from '../../../app/components/ui/UiSwipeRow.vue'

const THRESHOLD = 90
const MAX_PULL = 132

function mountRow(props: Record<string, unknown> = {}, slot = '<div>row</div>') {
  return mount(UiSwipeRow, {
    props,
    slots: { default: slot },
    global: { stubs: { UIcon: true } }
  })
}

type Row = ReturnType<typeof mountRow>

function content(wrapper: Row) {
  return wrapper.find('.touch-pan-y')
}

async function drag(wrapper: Row, dx: number, dy = 0) {
  await content(wrapper).trigger('pointerdown', { clientX: 0, clientY: 0 })
  await content(wrapper).trigger('pointermove', { clientX: dx, clientY: dy })
}

async function swipe(wrapper: Row, dx: number, dy = 0) {
  await drag(wrapper, dx, dy)
  await content(wrapper).trigger('pointerup')
}

function offsetOf(wrapper: Row) {
  const transform = content(wrapper).attributes('style')?.match(/translateX\((-?[\d.]+)px\)/)

  return Number(transform?.[1] ?? 0)
}

describe('uiSwipeRow', () => {
  it('удаляет свайпом влево за порог', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD + 10))

    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('не удаляет, если свайп не дошёл до порога', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD - 10))

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('игнорирует вертикальный жест — это скролл списка', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD + 10), -200)

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('без правого действия свайп вправо ничего не эмитит', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, THRESHOLD + 10)

    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('с rightAction свайп вправо за порог эмитит complete', async () => {
    const wrapper = mountRow({
      rightAction: { label: 'Edit', icon: 'i-lucide-pencil' }
    })

    await swipe(wrapper, THRESHOLD + 10)

    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('не удаляет, когда deletable выключен', async () => {
    const wrapper = mountRow({ deletable: false })

    await swipe(wrapper, -(THRESHOLD + 10))

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('тормозит палец резинкой за MAX_PULL', async () => {
    const wrapper = mountRow()

    await drag(wrapper, -(MAX_PULL + 100))

    const offset = Math.abs(offsetOf(wrapper))

    expect(offset).toBeGreaterThan(MAX_PULL)
    expect(offset).toBeLessThan(MAX_PULL + 100)
  })

  it('держит слой действия видимым, пока строка едет обратно', async () => {
    const wrapper = mountRow()

    await drag(wrapper, -(THRESHOLD - 10))
    expect(wrapper.find('.bg-danger').exists()).toBe(true)

    await content(wrapper).trigger('pointerup')
    expect(wrapper.find('.bg-danger').exists()).toBe(true)

    await content(wrapper).trigger('transitionend')
    expect(wrapper.find('.bg-danger').exists()).toBe(false)
  })

  it('гасит клик, который браузер шлёт после свайпа', async () => {
    const onTap = vi.fn()
    const wrapper = mountRow({}, '<button type="button">row</button>')

    wrapper.find('button').element.addEventListener('click', onTap)

    await swipe(wrapper, -(THRESHOLD + 10))
    await wrapper.find('button').trigger('click')

    expect(onTap).not.toHaveBeenCalled()
  })

  it('не мешает обычному тапу без движения', async () => {
    const onTap = vi.fn()
    const wrapper = mountRow({}, '<button type="button">row</button>')

    wrapper.find('button').element.addEventListener('click', onTap)

    await content(wrapper).trigger('pointerdown', { clientX: 0, clientY: 0 })
    await content(wrapper).trigger('pointerup')
    await wrapper.find('button').trigger('click')

    expect(onTap).toHaveBeenCalledTimes(1)
  })
})
